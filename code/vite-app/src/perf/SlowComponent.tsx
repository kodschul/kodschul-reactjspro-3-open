import { useState } from "react";
import "../App.css";

function SlowComponent() {
  return (
    <>
      <h1>This is a slow component</h1>
      <div className="card">
        <iframe
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30626.156151127983!2d9.16993722509122!3d48.76408830286456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4799db34c1ad8fd3%3A0x79d5c11c7791cfe4!2sStuttgart%2C%20Germany!5e0!3m2!1sen!2sin!4v1713679725983!5m2!1sen!2sin"
        ></iframe>
      </div>
    </>
  );
}

export default SlowComponent;
