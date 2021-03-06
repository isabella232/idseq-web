import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Form,
  Input,
  TextArea,
  Grid,
  Image,
  Message,
  Divider,
} from "semantic-ui-react";

import BasicPopup from "~/components/BasicPopup";
import { IconAlert, LogoReversed } from "~ui/icons";
import Container from "../ui/containers/Container";
import ExternalLink from "~ui/controls/ExternalLink";
import Link from "~ui/controls/Link";
import TransparentButton from "../ui/controls/buttons/TransparentButton";
import PrimaryButton from "../ui/controls/buttons/PrimaryButton";
import StringHelper from "../../helpers/StringHelper";
import ImgBacteriaPrimary from "~ui/illustrations/ImgBacteriaPrimary";
import ImgDetectPrimary from "~ui/illustrations/ImgDetectPrimary";
import ImgDecipherPrimary from "~ui/illustrations/ImgDecipherPrimary";

import cs from "./landing.scss";

class Landing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      institution: "",
      usage: "",
      submitMessage: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(_, { id, value }) {
    this.setState({ [id]: value });
  }

  handleSubmit() {
    if (!StringHelper.validateEmail(this.state.email)) {
      this.setState({ submitMessage: "Email is invalid." });
      return;
    }

    axios
      .post("sign_up", {
        signUp: {
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
          institution: this.state.institution,
          usage: this.state.usage,
        },
      })
      .then(() => {
        this.setState({
          firstName: "",
          lastName: "",
          email: "",
          institution: "",
          usage: "",
          submitMessage:
            "Thanks for your interest! Our product team will be in touch about accessing IDseq. If your team is already on IDseq, ask a collaborator to add you to a project to get immediate access.",
        });
      })
      .catch(() => {
        this.setState({
          submitMessage:
            "There was an error submitting the form. Please check required fields and try again.",
        });
      });
  }

  render() {
    const signInLink = () => {
      location.href = "/auth0/login";
    };
    const header = (
      <div className="header-row row">
        <div className="site-header col s12">
          <div className="left brand-details">
            <a href="/">
              <span className="logo-icon">
                <LogoReversed />
              </span>
            </a>
          </div>
          <div className="fill" />
          <div className={cs.links}>
            <ExternalLink
              className={cs.headerLink}
              href="https://help.idseq.net"
              analyticsEventName="Landing_help-center-link_clicked"
            >
              Help Center
            </ExternalLink>
            <ExternalLink
              className={cs.headerLink}
              href="https://www.discoveridseq.com/vr"
              analyticsEventName="Landing_video-tour-link_clicked"
            >
              Video Tour
            </ExternalLink>
            <ExternalLink
              className={cs.headerLink}
              href="https://chanzuckerberg.com/join-us/openings/?initiative=science"
              analyticsEventName="Landing_hiring-link_clicked"
            >
              Hiring
            </ExternalLink>
            <ExternalLink
              className={cs.headerLink}
              href="https://github.com/chanzuckerberg/idseq-workflows"
              analyticsEventName="Landing_github-link_clicked"
            >
              GitHub
            </ExternalLink>
          </div>
          {this.props.browserInfo.supported ? (
            <div className="sign-in">
              <TransparentButton
                text="Sign In"
                onClick={signInLink}
                disabled={!this.props.browserInfo.supported}
              />
            </div>
          ) : (
            <div className="alert-browser-support">
              {this.props.browserInfo.browser} is not currently supported.
              Please sign in from a different browser.
            </div>
          )}
        </div>
      </div>
    );

    let publicSiteBanner;
    if (this.props.showPublicSite) {
      publicSiteBanner = (
        <div className={cs.publicSiteBanner}>
          <BasicPopup
            content={
              "Learn how researchers in Cambodia used IDseq to sequence SARS-CoV-2"
            }
            position="bottom center"
            wide="very"
            trigger={
              <span className={cs.content}>
                <IconAlert className={cs.icon} />
                <span className={cs.title}>COVID-19:</span>
                <ExternalLink
                  className={cs.link}
                  href="https://public.idseq.net/covid-19?utm_source=idseq&utm_medium=banner&utm_campaign=covid-19"
                  analyticsEventName={"Landing_public-site-link_clicked"}
                >
                  Learn how researchers in Cambodia used IDseq to sequence
                  SARS-CoV-2
                </ExternalLink>
              </span>
            }
          />
        </div>
      );
    }

    const topTitle = (
      <div className="top-title">
        IDseq is a hypothesis-free global software platform that helps
        scientists identify pathogens in metagenomic sequencing data.
      </div>
    );

    const actionCards = (
      <Container>
        <div className={cs.actionCards}>
          <div className={cs.actionCard}>
            <ImgBacteriaPrimary className={cs.illustration} />
            <div className={cs.cardText}>
              <div className={cs.cardTitle}>Discover</div>
              <div className={cs.cardDescription}>
                Identify the pathogen landscape
              </div>
            </div>
          </div>
          <div className={cs.actionCard}>
            <ImgDetectPrimary className={cs.illustration} />
            <div className={cs.cardText}>
              <div className={cs.cardTitle}>Detect</div>
              <div className={cs.cardDescription}>
                Monitor and review potential outbreaks
              </div>
            </div>
          </div>
          <div className={cs.actionCard}>
            <ImgDecipherPrimary className={cs.illustration} />
            <div className={cs.cardText}>
              <div className={cs.cardTitle}>Decipher</div>
              <div className={cs.cardDescription}>
                Find potential infecting organisms in large datasets
              </div>
            </div>
          </div>
        </div>
      </Container>
    );

    const usageLabel = <label>How would you use IDseq?</label>;

    let submitMessageBanner;
    if (this.state.submitMessage) {
      submitMessageBanner = <Message content={this.state.submitMessage} />;
    }

    const interestForm = (
      <div className="account-form">
        <div className="form-header">
          <div className="form-title">Learn more about IDseq</div>
          {this.props.browserInfo.supported && (
            <div className="form-description">
              Already have an account? <a href="/auth0/login">Sign in.</a>
            </div>
          )}
        </div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths={2}>
            <Form.Field
              control={Input}
              label="First Name"
              id="firstName"
              value={this.state.firstName}
              onChange={this.handleChange}
            />
            <Form.Field
              control={Input}
              label="Last Name"
              id="lastName"
              value={this.state.lastName}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Field
            control={Input}
            label="Email"
            id="email"
            value={this.state.email}
            onChange={this.handleChange}
          />
          <Form.Field
            control={Input}
            label="Affiliated Institution or Company"
            id="institution"
            value={this.state.institution}
            onChange={this.handleChange}
          />
          <Form.Field
            control={TextArea}
            label={usageLabel}
            value={this.state.usage}
            onChange={this.handleChange}
            id="usage"
          />
          {submitMessageBanner}
          <div className="submit-button">
            <PrimaryButton text="Submit" />
          </div>
        </Form>
      </div>
    );

    const firstBlock = (
      <div className="row first-block">
        <Grid container stackable columns={2}>
          <Grid.Column width={9}>
            {topTitle}
            {actionCards}
          </Grid.Column>
          <Grid.Column width={7}>{interestForm}</Grid.Column>
        </Grid>
      </div>
    );

    const paperReference = (
      <div className={cs.paperReferenceBanner}>
        <Container>
          <div className={cs.paperReferenceContainer}>
            {/* move to its own component if needs to be reused */}
            <div className={cs.paperCard}>
              <div className={cs.paperCardTitle}>
                IDseq – An Open Source Cloud-based Pipeline and Analysis Service
                for Metagenomic Pathogen Detection and Monitoring.
              </div>
              <div className={cs.paperCardLogoContainer}>
                <Image
                  className={cs.paperCardLogo}
                  src="/assets/logo-gigascience.png"
                />
              </div>
            </div>
            <div className={cs.paperInfo}>
              <div className={cs.paperInfoTitle}>
                Read the paper on how IDseq reduces the barrier of entry to
                metagenomics.
              </div>
              <div className={cs.paperInfoBody}>
                See how scientists, clinicians and bioinformaticians can gain
                insight from mNGS datasets for both known and novel pathogens.
              </div>
              <div>
                <ExternalLink
                  href="https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaa111/5918865"
                  analyticsEventName="Landing_paper-link_clicked"
                >
                  <PrimaryButton text="Read the Paper" />
                </ExternalLink>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );

    let bulletinBanner = null;
    if (this.props.showBulletin) {
      bulletinBanner = (
        <div className="bulletin-banner">
          <Container>
            <div className="bulletin-title">Experience IDseq in Action</div>
            <div className="bulletin-description">
              Journey to the frontlines of global health with a 360° video tour.
              See how a local researcher quickly detects the source of a
              meningitis outbreak in Dhaka, Bangladesh by using IDseq
              technology.
            </div>
            <ExternalLink
              href="https://discoveridseq.com/vr"
              analyticsEventName="Landing_video-tour-link_clicked"
            >
              <TransparentButton text="Take a Video Tour" />
            </ExternalLink>
          </Container>
        </div>
      );
    }

    const partners = (
      <div className="partners-block">
        <div className="partner-title">IN PARTNERSHIP WITH</div>
        <Grid columns={2} className="partner-logos">
          <Grid.Column>
            <Image
              className="first-logo"
              src="/assets/logo-czi.jpg"
              as="a"
              href="https://www.chanzuckerberg.com/"
              target="_blank"
              rel="noopener noreferrer"
            />
          </Grid.Column>
          <Grid.Column>
            <Image
              className="second-logo"
              src="/assets/logo-biohub.jpg"
              as="a"
              href="https://www.czbiohub.org/"
              target="_blank"
              rel="noopener noreferrer"
            />
          </Grid.Column>
        </Grid>
      </div>
    );

    const mailto = "mailto:" + this.props.contactEmail;
    const footer = (
      <div className={cs.footer}>
        <Link className={cs.footerLink} href={mailto}>
          Contact
        </Link>
        <ExternalLink className={cs.footerLink} href="https://idseq.net/terms">
          Terms
        </ExternalLink>
        <ExternalLink
          className={cs.footerLink}
          href="https://idseq.net/privacy"
        >
          Privacy
        </ExternalLink>
        <ExternalLink
          className={cs.footerLink}
          href="https://github.com/chanzuckerberg/idseq-workflows"
          analyticsEventName="Landing_github-footer-link_clicked"
        >
          GitHub
        </ExternalLink>
      </div>
    );

    return (
      <div>
        {header}
        {publicSiteBanner}
        {firstBlock}
        {paperReference}
        {bulletinBanner}
        {!paperReference && !bulletinBanner && <Divider />}
        {partners}
        {footer}
      </div>
    );
  }
}

Landing.propTypes = {
  contactEmail: PropTypes.string.isRequired,
  showBulletin: PropTypes.bool,
  browserInfo: PropTypes.object,
  showPublicSite: PropTypes.bool,
};

export default Landing;
