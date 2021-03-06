require 'open3'
require 'csv'
require 'English'
task load_lineage_db: :environment do
  local_taxonomy_path = "/app/tmp/taxonomy"
  host = Rails.env.development? ? 'db' : '$RDS_ADDRESS'
  taxid_lineages_file = 'taxid-lineages.csv'
  names_file = 'names.csv'
  preload_s3_path = 's3://czbiohub-infectious-disease/references'

  # Use 'OUTPUT_PATH_S3=s3://czbiohub-infectious-disease/references idseq_pipeline lineages' to generate and upload the necessary files
  ` mkdir -p #{local_taxonomy_path};
    cd #{local_taxonomy_path};

    aws s3 cp #{preload_s3_path}/#{taxid_lineages_file}.gz .
    aws s3 cp #{preload_s3_path}/#{names_file}.gz .

    # import to database
    gunzip -f *.csv.gz;
    mv #{taxid_lineages_file} taxon_lineages
    mysqlimport --delete --local --user=$DB_USERNAME --host=#{host} --password=$DB_PASSWORD --ignore-lines=1 --columns=taxid,superkingdom_taxid,phylum_taxid,class_taxid,order_taxid,family_taxid,genus_taxid,species_taxid --fields-terminated-by=',' idseq_#{Rails.env} taxon_lineages;

    mv #{names_file} taxon_names;
    mysqlimport --delete --ignore-lines=1 --local --user=$DB_USERNAME --host=#{host} --columns=taxid,name,common_name --password=$DB_PASSWORD --fields-terminated-by=',' idseq_#{Rails.env} taxon_names;

    for taxl in species genus family order class phylum superkingdom ; do
      # print out sql command
      echo "update taxon_lineages inner join taxon_names on taxon_lineages.${taxl}_taxid = taxon_names.taxid set taxon_lineages.${taxl}_name = taxon_names.name, taxon_lineages.${taxl}_common_name = taxon_names.common_name;" | mysql --user=$DB_USERNAME --host=#{host} --password=$DB_PASSWORD idseq_#{Rails.env};
    done
    cd /app;
    rm -rf #{local_taxonomy_path};
  `
  raise "lineage database import failed" unless $CHILD_STATUS.success?
end
