import React from "react";
import "./ComingSoon.css";
import bgImg from "../assets/background.png";

export default function ComingSoon() {
  return (
    <section className="coming-soon">
      <img src={bgImg} alt="AKS Wear" className="background-image" />

      <div className="overlay"></div>

      <div className="content">
        <span className="brand">AKS WEAR</span>

        <h1>
          Premium Football
          <br />
          Jerseys
        </h1>

        <p>
          Our new collection is coming soon.
          Designed for football fans who want premium quality and authentic style.
        </p>

        <div className="buttons">
          <a
            href="https://www.instagram.com/akswear.shop/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61589757476263"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>

          <a
            href="https://wa.me/212675777859"
            target="_blank"
            rel="noreferrer"
            className="primary"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}