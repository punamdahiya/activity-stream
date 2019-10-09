/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { actionCreators as ac } from "common/Actions.jsm";
import { addUtmParams } from "../../templates/FirstRun/addUtmParams";
import React from "react";

export class FXASignupForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onInputInvalid = this.onInputInvalid.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);

    this.state = {
      emailInput: "",
      isSignIn: false,
    };
  }

  get email() {
    return this.props.document
      .getElementById("fxaSignupForm")
      .querySelector("input[name=email]");
  }

  get signInURL() {
    const urlObj = new URL(this.props.fxaEndpoint);
    urlObj.pathname = "signin";
    return urlObj.toString();
  }

  onSubmit(event) {
    // Dynamically require the email on submission so screen readers don't read
    // out it's always required because there's also ways to skip the modal
    if (this.state.isSignIn) {
      return;
    }
    const { email } = event.target.elements;
    if (!email.value.length) {
      email.required = true;
      email.checkValidity();
      event.preventDefault();
      return;
    }

    // Report to telemetry additional information about the form submission.
    const value = { has_flow_params: !!this.props.flowParams.flowId.length };
    this.props.dispatch(ac.UserEvent({ event: "SUBMIT_EMAIL", value }));

    global.addEventListener("visibilitychange", this.props.onClose);
  }

  handleSignIn(event) {
    event.preventDefault();
    // Check event target element is signin link
    if (event.target.id !== "signin") {
      return;
    }

    // Check if there is key pressed on signin link and continue
    // only if "Enter" is pressed
    if (event.key && event.key !== "Enter") {
      return;
    }

    this.setState({ isSignIn: true });
    this.email.required = false;
    this.email.disabled = true;

    // Report to telemetry additional information about the form submission.
    const value = { has_flow_params: !!this.props.flowParams.flowId.length };
    this.props.dispatch(ac.UserEvent({ event: "SUBMIT_SIGNIN", value }));

    global.addEventListener("visibilitychange", this.props.onClose);
    this.refs.form.submit();
  }

  componentDidMount() {
    // Start with focus in the email input box
    if (this.email) {
      this.email.focus();
    }
  }

  onInputChange(e) {
    let error = e.target.previousSibling;
    this.setState({ emailInput: e.target.value });
    error.classList.remove("active");
    e.target.classList.remove("invalid");
  }

  onInputInvalid(e) {
    let error = e.target.previousSibling;
    error.classList.add("active");
    e.target.classList.add("invalid");
    e.preventDefault(); // Override built-in form validation popup
    e.target.focus();
  }

  render() {
    const { content, UTMTerm } = this.props;
    const { isSignIn } = this.state;
    return (
      <div
        id="fxaSignupForm"
        role="group"
        aria-labelledby="joinFormHeader"
        aria-describedby="joinFormBody"
        className="fxaSignupForm"
      >
        <h3 id="joinFormHeader" data-l10n-id={content.form.title.string_id} />
        <p id="joinFormBody" data-l10n-id={content.form.text.string_id} />
        <form
          method="get"
          action={isSignIn ? this.signInURL : this.props.fxaEndpoint}
          target="_blank"
          rel="noopener noreferrer"
          ref="form"
          onSubmit={this.onSubmit}
        >
          <input name="service" type="hidden" value="sync" />
          <input name="action" type="hidden" value="email" />
          <input name="context" type="hidden" value="fx_desktop_v3" />
          <input
            name="entrypoint"
            type="hidden"
            value="activity-stream-firstrun"
          />
          <input name="utm_source" type="hidden" value="activity-stream" />
          <input name="utm_campaign" type="hidden" value="firstrun" />
          <input name="utm_term" type="hidden" value={UTMTerm} />
          <input
            name="device_id"
            type="hidden"
            value={this.props.flowParams.deviceId}
          />
          <input
            name="flow_id"
            type="hidden"
            value={this.props.flowParams.flowId}
          />
          <input
            name="flow_begin_time"
            type="hidden"
            value={this.props.flowParams.flowBeginTime}
          />
          <input name="style" type="hidden" value="trailhead" />
          <p
            data-l10n-id="onboarding-join-form-email-error"
            className="error"
          />
          <input
            data-l10n-id={content.form.email.string_id}
            name="email"
            type="email"
            onInvalid={this.onInputInvalid}
            onChange={this.onInputChange}
          />
          <p className="fxa-terms" data-l10n-id="onboarding-join-form-legal">
            <a
              data-l10n-name="terms"
              target="_blank"
              rel="noopener noreferrer"
              href={addUtmParams(
                "https://accounts.firefox.com/legal/terms",
                UTMTerm
              )}
            />
            <a
              data-l10n-name="privacy"
              target="_blank"
              rel="noopener noreferrer"
              href={addUtmParams(
                "https://accounts.firefox.com/legal/privacy",
                UTMTerm
              )}
            />
          </p>
          <button data-l10n-id={content.form.button.string_id} type="submit" />
          {this.props.showSignInLink && (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <p
              className="fxa-signin"
              data-l10n-id="onboarding-join-form-signin"
              onClick={this.handleSignIn}
              onKeyDown={this.handleSignIn}
            >
              <a
                href={false}
                tabIndex="0"
                data-l10n-name="signin"
                id="signin"
              />
            </p>
          )}
        </form>
      </div>
    );
  }
}

FXASignupForm.defaultProps = { document: global.document };
