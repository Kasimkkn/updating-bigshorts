"use client";

import React from "react";

const ChildSafetyPolicyPage = () => (
  <main className="min-h-screen w-full flex items-center justify-center bg-bg-color py-8 px-2">
    <section className="w-full max-w-3xl bg-primary-bg-color rounded-2xl p-8 md:p-12 flex flex-col gap-6">
      <header>
        <h1 className="text-4xl font-extrabold text-primary-text-color mb-2 text-center drop-shadow">
          Child Safety Standards Policy
        </h1>
        {/*<p className="text-center text-base text-text-color mb-4">
          Last updated: January 23, 2025
        </p>*/}
      </header>
      <article className="prose prose-lg max-w-none text-text-color">
        <p>
          BigShorts is committed to creating a safe, responsible, and secure platform, ensuring the well-being of all users, particularly children, in compliance with Indian legal standards and global expectations. This policy is drafted in compliance with Indian laws, including the Information Technology Act, 2000, the Protection of Children from Sexual Offences (POCSO) Act, 2012, and the Digital Personal Data Protection Act, 2023. It also adheres to Google Play&rsquo;s updated Child Safety Standards policy, effective March 19, 2025. This document establishes our commitment to combating Child Sexual Abuse and Exploitation (CSAE), ensuring that our platform is a safe and secure environment for all users.
        </p>
        <h2>Definitions and Scope</h2>
        <ul className="list-disc list-inside">
          <li>
            <strong>Child Sexual Abuse Material (CSAM):</strong> Refers to any visual depiction (photos, videos, illustrations) or text that portrays sexually explicit conduct involving a minor, as defined under the POCSO Act and Section 67B of the IT Act.
          </li>
          <li>
            <strong>Child Exploitation:</strong> Any act or communication that takes advantage of or endangers a minor&rsquo;s physical, emotional, or psychological well-being, including grooming, trafficking, or solicitation for sexual activities.
          </li>
          <li>
            <strong>Grooming:</strong> The process of establishing a connection with a minor to manipulate or coerce them into engaging in sexual activities, sharing explicit materials, or meeting in person for exploitative purposes.
          </li>
          <li>
            <strong>Sextortion:</strong> A form of blackmail where a perpetrator threatens to share a victim&rsquo;s intimate images unless additional sexual content, money, or other favors are provided.
          </li>
          <li>
            <strong>Prohibited Content:</strong> Content that includes, promotes, or glorifies violence, self-harm, exploitation, or any other illegal or harmful activity involving minors.
          </li>
          <li>
            <strong>Minor:</strong> Any individual under the age of 18.
          </li>
        </ul>

        <h2>Scope of the Policy</h2>
        <ul className="list-disc list-inside">
          <li>All content, interactions, and communications hosted, shared, or transmitted through the BigShorts platform.</li>
          <li>All users, including but not limited to, app developers, content creators, end-users, and third-party contributors engaging with BigShorts.</li>
          <li>
            The policy outlines prohibited content and activities, reporting mechanisms for CSAE-related violations, and the processes and actions undertaken by BigShorts to prevent and address violations.
          </li>
        </ul>

        <h2>Compliance with Laws and Global Standards</h2>
        <ul className="list-disc list-inside">
          <li>Indian laws, including the POCSO Act, 2012, IT Act, 2000, and DPDP Act, 2023.</li>
          <li>Google Play&rsquo;s Child Safety Standards, which require the implementation of clear CSAE policies accessible globally.</li>
          <li>Global child protection initiatives such as those by Interpol and the National Center for Missing &amp; Exploited Children (NCMEC).</li>
        </ul>

        <h2>Prohibited Content and Behaviors</h2>
        <p>BigShorts maintains a zero-tolerance policy for the following:</p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Child Sexual Abuse Material (CSAM):</strong> Content that depicts, promotes, or glorifies child sexual exploitation in any form.
          </li>
          <li>
            <strong>Grooming or Predatory Behavior:</strong> Efforts to befriend, manipulate, or coerce minors for sexual or exploitative purposes.
          </li>
          <li>
            <strong>Inappropriate Child-Oriented Content:</strong> Content targeting children that includes violence, explicit material, or material promoting self-harm or other unsafe behaviors.
          </li>
          <li>
            <strong>Encouraging Illegal Activities:</strong> Content encouraging minors to engage in unlawful acts or activities harmful to their well-being.
          </li>
        </ul>

        <h2>Reporting Mechanisms</h2>
        <p>BigShorts provides multiple reporting channels to ensure that CSAE concerns are addressed promptly:</p>
        <ul className="list-disc list-inside">
          <li>
            <strong>In-App Reporting:</strong> Users can report inappropriate content, accounts, or interactions through the in-app &quot;Report&quot; feature. Every report is automatically flagged for review by our moderation team.
          </li>
          <li>
            <strong>Email Support:</strong> Concerns can be sent directly to <a href="mailto:support@bigshorts.com" className="text-blue-600 underline">support@bigshorts.com</a>, where a dedicated team responds within 24 hours.
          </li>
          <li>
            <strong>Direct Reporting to Authorities:</strong> Users can also report incidents to the National Cybercrime Reporting Portal (<a href="https://cybercrime.gov.in" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a>) or local law enforcement.<br />
            <strong>NCPCR Contact:</strong> Users can directly report child safety violations to the National Commission for Protection of Child Rights (NCPCR) at <a href="https://www.ncpcr.gov.in" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.ncpcr.gov.in</a>.
          </li>
          <li>
            <strong>Confidentiality:</strong> All reports are treated confidentially, with strict adherence to privacy laws.
          </li>
          <li>
            <strong>Details to Include When Reporting:</strong>
            <ul className="list-[circle] ml-8">
              <li>A description of the issue or violation.</li>
              <li>Links, screenshots, or recordings related to the reported incident.</li>
              <li>Any additional evidence to help expedite the review process.</li>
            </ul>
          </li>
        </ul>

        <h2>Content Moderation and Handling CSAE Incidents</h2>
        <ul className="list-disc list-inside">
          <li>
            <strong>Content Review and Removal:</strong> Content flagged as CSAE is reviewed by a dedicated moderation team trained in identifying and managing such issues. Verified violations are removed immediately (within 24 hours).
          </li>
          <li>
            <strong>Account Actions:</strong> Accounts responsible for CSAE violations are permanently banned from the platform.
          </li>
          <li>
            <strong>Reporting to Authorities:</strong> All confirmed CSAE incidents are promptly reported to the relevant Indian authorities, such as the National Crime Records Bureau (NCRB), NCPCR, or other global organizations like NCMEC.
          </li>
          <li>
            <strong>Tracking Repeat Offenders:</strong> BigShorts maintains a database of banned users to prevent re-registration or repeat offenses.
          </li>
        </ul>

        <h2>Preventive Measures and User Education</h2>
        <ul className="list-disc list-inside">
          <li>
            <strong>Community Standards Awareness:</strong> Regular in-app reminders about our community guidelines and reporting mechanisms. User prompts on sensitive content to ensure informed participation.
          </li>
          <li>
            <strong>Content Creator Compliance:</strong> Content creators are required to adhere to strict child-safety guidelines, with mandatory review processes for child-oriented material.
          </li>
          <li>
            <strong>Collaborations:</strong> BigShorts collaborates with child protection organizations to ensure compliance and enhance safety protocols.
          </li>
        </ul>

        <h2>Data Privacy and Security</h2>
        <ul className="list-disc list-inside">
          <li>Sensitive personal data of children is collected and processed only with verifiable parental consent.</li>
          <li>Robust data security measures, including encryption and restricted access, safeguard user information.</li>
        </ul>

        <h2>Commitment to Continuous Improvement</h2>
        <ul className="list-disc list-inside">
          <li>
            <strong>Regular Audits:</strong> Conduct regular audits of content moderation systems and policies to identify gaps and enhance effectiveness.
          </li>
          <li>
            <strong>Staff Training:</strong> Train moderation staff to handle CSAE issues with sensitivity and efficiency.
          </li>
          <li>
            <strong>Technological Upgrades:</strong> Invest in AI tools to proactively detect and flag potentially harmful content.
          </li>
        </ul>

        <h2>Contact Information</h2>
        <p>
          For questions, concerns, or to report violations, please contact:
          <ul className="list-disc list-inside ml-8 my-2">
            <li>
              Email: <a href="mailto:support@bigshorts.co" className="text-blue-600 underline">support@bigshorts.co</a>
            </li>
            <li>
              Support Center: <a href="https://www.bigshorts.com/support" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.bigshorts.com/support</a>
            </li>
          </ul>
          BigShorts also encourages users to contact relevant authorities if they believe a child is in immediate danger.
        </p>

        <h2>Legal Disclaimer</h2>
        <p>
          This policy is aligned with Indian laws and global standards as of January 23, 2025. BigShorts reserves the right to modify the policy as necessary to comply with changes in the law or Google Play&rsquo;s requirements.
        </p>
      </article>
      <footer className="pt-4 border-t border-gray-200 flex flex-col items-center">
        <span className="linearText text-2xl font-bold">BigShorts</span>
        <span className="text-gray-500 font-semibold text-sm">v1.0.8</span>
      </footer>
    </section>
  </main>
);

export default ChildSafetyPolicyPage;
