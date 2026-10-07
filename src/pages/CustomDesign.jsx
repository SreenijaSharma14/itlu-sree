import { useState } from "react";
import { Link } from "react-router-dom";

function CustomDesign() {
  const [submitted, setSubmitted] = useState(false);
  const [imageName, setImageName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    idea: "",
    size: "",
    budget: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImageName(file.name);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  /* =========================
     SUCCESS
  ========================= */

  if (submitted) {
    return (
      <main className="custom-success">
        <div className="success-content">

          <p className="eyebrow">
            CUSTOM REQUEST RECEIVED
          </p>

          <div className="success-mark">
            ✓
          </div>

          <h1>
            Let's make it yours.
          </h1>

          <p>
            Thank you for sharing your idea.
            We'll get in touch with you shortly
            to discuss your custom piece.
          </p>

          <div className="custom-success-note">
            <strong>
              What happens next?
            </strong>

            <p>
              We'll review your idea, discuss the
              design and pricing with you, and
              confirm everything before starting
              the painting.
            </p>
          </div>

          <Link
            to="/"
            className="primary-button"
          >
            Back to home
          </Link>

        </div>
      </main>
    );
  }

  /* =========================
     CUSTOM DESIGN PAGE
  ========================= */

  return (
    <main className="custom-page">

      <div className="custom-container">

        {/* LEFT — INTRO */}

        <div className="custom-intro">

          <Link
            to="/"
            className="back-link"
          >
            ← Back to home
          </Link>

          <p className="eyebrow">
            CUSTOM DESIGN
          </p>

          <h1>
            Something only
            <br />
            you could wear.
          </h1>

          <p className="custom-description">
            Have an inspiration image, a favourite
            character, a memory, or simply an idea
            you've been carrying around?
            Tell us about it.
          </p>

          <div className="custom-process">

            <div className="process-item">
              <span>01</span>
              <p>Share your idea</p>
            </div>

            <div className="process-item">
              <span>02</span>
              <p>We'll discuss the design</p>
            </div>

            <div className="process-item">
              <span>03</span>
              <p>Your piece gets painted by hand</p>
            </div>

          </div>

        </div>


        {/* RIGHT — FORM */}

        <div className="custom-form-wrapper">

          <form
            className="custom-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-field">

              <label htmlFor="custom-name">
                Your name
              </label>

              <input
                id="custom-name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* PHONE + EMAIL */}

            <div className="form-grid">

              <div className="form-field">

                <label htmlFor="custom-phone">
                  Phone number
                </label>

                <input
                  id="custom-phone"
                  name="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-field">

                <label htmlFor="custom-email">
                  Email address
                </label>

                <input
                  id="custom-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* IDEA */}

            <div className="form-field">

              <label htmlFor="custom-idea">
                Tell us about your idea
              </label>

              <textarea
                id="custom-idea"
                name="idea"
                rows="6"
                placeholder="Tell us what you'd like painted..."
                value={formData.idea}
                onChange={handleChange}
                required
              />

            </div>


            {/* IMAGE */}

            <div className="form-field">

              <label>
                Reference image
                <span>optional</span>
              </label>

              <label
                htmlFor="custom-image"
                className="image-upload"
              >

                <span className="upload-symbol">
                  +
                </span>

                <span>
                  {imageName ||
                    "Upload an inspiration image"}
                </span>

                <small>
                  JPG, PNG or WEBP
                </small>

              </label>

              <input
                id="custom-image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
                hidden
              />

            </div>


            {/* SIZE + BUDGET */}

            <div className="form-grid">

              <div className="form-field">

                <label htmlFor="custom-size">
                  Preferred size
                </label>

                <select
                  id="custom-size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a size
                  </option>

                  <option value="XXS">XXS</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>

                </select>

              </div>


              <div className="form-field">

                <label htmlFor="custom-budget">
                  Budget range
                </label>

                <select
                  id="custom-budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a range
                  </option>

                  <option value="₹500 – ₹700">
                    ₹500 – ₹700
                  </option>

                  <option value="₹700 – ₹1,000">
                    ₹700 – ₹1,000
                  </option>

                  <option value="₹1,000 – ₹1,500">
                    ₹1,000 – ₹1,500
                  </option>

                  <option value="₹1,500+">
                    ₹1,500+
                  </option>

                </select>

              </div>

            </div>


            {/* PRICING NOTE */}

            <p className="custom-pricing-note">
              Custom pricing depends on the complexity
              of the design and the materials required.
              We'll confirm the final price with you
              before starting.
            </p>


            {/* SUBMIT */}

            <button
              type="submit"
              className="primary-button custom-submit"
            >
              Send custom request →
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

export default CustomDesign;