"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logo from '@/assets/logo.svg';
import Button from '@/components/shared/Button';
import {
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaInfoCircle,
  FaDatabase,
  FaUserShield,
  FaExchangeAlt,
  FaTrash,
  FaClock,
  FaUserCog,
  FaBalanceScale
} from 'react-icons/fa';
import SafeImage from '@/components/shared/SafeImage';

const PrivacyPolicyPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("introduction");

  // Define sections for tab navigation - wrapped in useMemo to fix the dependency warning
  const sections = useMemo(() => [
    { id: "introduction", label: "Introduction" },
    { id: "info-collected", label: "Information Collected" },
    { id: "info-usage", label: "How We Use Information" },
    { id: "data-collection", label: "Data Collection" },
    { id: "data-retention", label: "Data Retention" },
    { id: "security", label: "Security & Privacy" },
    { id: "rights", label: "Your Rights" }
  ], []);

  const handleTabClick = (tabId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tabId);
    document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Set active tab based on scroll position
    const handleScroll = () => {
      // Find the section that's currently most visible in the viewport
      let currentSection = activeTab;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section is in the top half of the viewport
          if (rect.top <= 150 && rect.bottom > 150) {
            currentSection = section.id;
            break;
          }
        }
      }
      if (currentSection !== activeTab) {
        setActiveTab(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, sections]);

  // Define content for each section
  const sectionContent = {
    "introduction": (
      <div className="space-y-4">
        <div className="bg-yellow-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-yellow-700 mb-2">Partners</h4>
          <p>Some of your Personal Information or Sensitive Personal Data or Information will be shared with affiliated partners. These partners operate on the Mobile App or advertise their products/services. You can identify when a third party is involved in your transactions (if any), and we share customer information related to those transactions with that third party.</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-yellow-700 mb-2">Our Legal Obligations</h4>
          <p>We may disclose details of account and other Personal Information in case we believe in good faith that such release is appropriate to comply with applicable law including to: (a) comply with the legal requirements or legal processes; (b) protect rights or property or affiliated companies; (c) prevent a crime or in interest of national security; or (d) protect safety of our Users or the public.</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-yellow-700 mb-2">Sharing Upon Merger or Amalgamation</h4>
          <p>Any third party to which we transfer or sell our assets, merge, amalgamate or consolidate with, will have the right to continue to use the Personal Information and Sensitive Personal Data or Information you provide, in accordance with the Terms and Conditions and this Privacy Policy.</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-yellow-700 mb-2">Improving Our Business</h4>
          <p>You acknowledge and understand that we have a right to use your non-identifiable data for improving our Services, marketing, and promotional efforts, to personalize your use of the Mobile App.</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-5">
          <h4 className="font-medium text-yellow-700 mb-2">Transfer to Third Parties</h4>
          <p>Subject to the laws applicable, we may at our sole discretion, share your Personal Information and Sensitive Personal Data or Information to any other body corporate that ensures at least the same level of data protection as is provided by us under the terms hereof, located in India or any other country.</p>
        </div>
      </div>
    ),
    "info-collected": (
      <div className="space-y-4">
        <p>We collect various types of information to provide and improve our service to you:</p>
        <div className="bg-blue-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-blue-700 mb-2">Personal Information</h4>
          <p>Information that can be used to identify you such as your name, email address, phone number, and payment information.</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-blue-700 mb-2">Usage Data</h4>
          <p>Information collected automatically such as how you interact with our app, including the features you use, the time spent on the app, and other usage statistics.</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-5">
          <h4 className="font-medium text-blue-700 mb-2">Device Information</h4>
          <p>Information about your device such as IP address, device type, operating system, and browser information.</p>
        </div>
      </div>
    ),
    "info-usage": (
      <div className="space-y-4">
        <p>We use the information we collect for various purposes:</p>
        <div className="bg-green-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-green-700 mb-2">Providing Services</h4>
          <p>To provide, maintain, and improve our services to you.</p>
        </div>
        <div className="bg-green-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-green-700 mb-2">Personalization</h4>
          <p>To personalize your experience and to deliver content relevant to your interests.</p>
        </div>
        <div className="bg-green-50 rounded-lg p-5">
          <h4 className="font-medium text-green-700 mb-2">Communication</h4>
          <p>To communicate with you about updates, security alerts, and support messages.</p>
        </div>
      </div>
    ),
    "data-collection": (
      <div className="space-y-4">
        <p>Our data collection methods include:</p>
        <div className="bg-purple-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-purple-700 mb-2">Direct Collection</h4>
          <p>Information you provide to us directly when you register an account or use our services.</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-purple-700 mb-2">Automated Collection</h4>
          <p>Information collected automatically through your use of our services, including through cookies and similar technologies.</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-5">
          <h4 className="font-medium text-purple-700 mb-2">Third-Party Sources</h4>
          <p>Information we may receive from third-party partners that help us provide our services.</p>
        </div>
      </div>
    ),
    "data-retention": (
      <div className="space-y-4">
        <p>How long we keep your information:</p>
        <div className="bg-orange-50 rounded-lg p-5 mb-4">
          <h4 className="font-medium text-orange-700 mb-2">Account Information</h4>
          <p>We retain your account information for as long as your account is active and for a period thereafter to allow you to re-activate your account, to comply with legal obligations, or to resolve disputes.</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-5">
          <h4 className="font-medium text-orange-700 mb-2">Usage Data</h4>
          <p>We may retain usage data for internal analysis purposes. This data is generally retained for a shorter period, except when it is used to strengthen security or to improve functionality.</p>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-text-color">
      {/* Hero Section */}
      <div className="bg-primary-bg-color text-primary-text-color py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 bg-opacity-20 bg-primary-bg-color rounded-full mb-6">
            <FaLock className="text-4xl" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 drop-shadow">Privacy Policy</h1>
          <div className="text-xl max-w-3xl mx-auto">
            How we collect, use, and protect your information
          </div>
          <div className="text-sm mt-4">Last Updated: March 16, 2024</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-primary-bg-color border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="flex px-4 space-x-4">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={handleTabClick(section.id)}
                className={`whitespace-nowrap font-medium px-4 py-3 border-b-2 transition-colors ${activeTab === section.id ? 'border-primary-text-color text-primary-text-color' : 'border-transparent text-gray-500 hover:text-primary-text-color'
                  }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-16">
          {/* Introduction Section */}
          <section id="introduction" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-6">Introduction</h2>
            {sectionContent["introduction"]}
            <div className="bg-blue-600 text-primary-text-color p-6 rounded-lg mt-6">
              <h3 className="text-xl font-semibold mb-3">Important Note</h3>
              <p className="text-lg font-medium">We don&apos;t sell your information and we never will.</p>
            </div>
          </section>

          {/* Information Collected Section */}
          <section id="info-collected" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-6">Information Collected</h2>
            {sectionContent["info-collected"]}
          </section>

          {/* How We Use Information Section */}
          <section id="info-usage" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-6">How We Use Information</h2>
            {sectionContent["info-usage"]}
          </section>

          {/* Data Collection Section */}
          <section id="data-collection" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-6">Data Collection</h2>
            {sectionContent["data-collection"]}
          </section>

          {/* Data Retention Section */}
          <section id="data-retention" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-6">Data Retention</h2>
            {sectionContent["data-retention"]}
          </section>

          {/* Security Section */}
          <section id="security" className="scroll-mt-16">
            <div className="flex items-start mb-6">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaShieldAlt className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-text-color">Security & Privacy</h2>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Security Measures</h3>
                <p className="mb-4">
                  Your Personal Information and Sensitive Personal Data or Information&apos;s security is important to us. We have implemented security policies, rules and technical measures, as required under applicable law including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary-bg-color p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FaShieldAlt className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">Firewalls</div>
                        <p className="text-sm text-gray-600">Protection against unauthorized access</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary-bg-color p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FaLock className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">Transport Layer Security</div>
                        <p className="text-sm text-gray-600">Secure data transmission</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary-bg-color p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FaUserShield className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">Physical Security</div>
                        <p className="text-sm text-gray-600">Protection of physical infrastructure</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary-bg-color p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FaShieldAlt className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">Electronic Security</div>
                        <p className="text-sm text-gray-600">Monitoring and prevention systems</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p>Your information is stored in secured networks and is only accessible to authorized persons who have access rights to such systems or otherwise to persons who require such information for the purposes provided in this Privacy Policy. These authorized persons are also required to keep such information confidential.</p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5">
                <p className="text-yellow-800">
                  Although we make the best possible efforts to transmit and store all the information provided by you in a secure system that is not accessible to the public, you understand and acknowledge that complete security is not guaranteed and that there is a guarantee of unintended disclosures of any information and potential security breaches.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Cookie Policy</h3>
                <div className="bg-secondary-bg-color-50 rounded-lg p-6">
                  <p className="mb-4">We may use cookies, web beacons, tracking pixels, and other tracking technologies when you visit our Mobile App to help customize the Mobile App and improve your experience. We may use &quot;cookies&quot; and &quot;automatically collected&quot; information that is been collected on the Mobile App to:</p>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>Personalize our Services, such as remembering your information so that you will not have to re-enter it during your visit or the next time you avail of the Services</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>Provide customized advertisements, content, and information</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>Monitor and analyze the effectiveness of the Services and third-party marketing activities</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>Monitor aggregate Mobile App usage metrics such as total number of visitors and pages viewed</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>Track your entries, submissions, and status in any promotions or other activities on the Mobile App</span>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-bg-color-50 rounded-lg p-6 mt-4">
                  <p className="mb-3">We reserve the right to make changes to this Cookie Policy at any time and for any reason. We will alert you about any changes by updating the &quot;Last Updated&quot; date of this Cookie Policy. Any changes or modifications will be effective immediately upon posting the updated Cookie Policy on the Mobile App, and you waive the right to receive specific notice of each such change or modification.</p>
                  <p>You are encouraged to periodically review this Cookie Policy to stay informed of updates. You will be deemed to have been made aware of, will be subject to, and will be deemed to have accepted the changes in any revised Cookie Policy by your continued use of the Mobile App after the date such revised Cookie Policy is posted.</p>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Third-Party Links</h3>
                <div className="space-y-4">
                  <p>Mobile app may include hyperlinks to various external websites and applications, and may also include advertisements, and hyperlinks to applications, content, or resources <strong>(&quot;Third-Party Links&quot;)</strong>. We do not provide any personally identifiable User information to these advertisers or third-party websites or applications.</p>
                  <p>You acknowledge and agree that we are not responsible for any collection or disclosure of your information by any external websites, applications, companies, or persons thereof. The presence of any Third-Party Links on our Mobile App, cannot be construed as a recommendation, endorsement, or solicitation for the same, or any other material on or available via such Third-Party Links.</p>
                  <p>You further acknowledge and agree that we are not liable for any loss or damage that may be incurred by you as a result of the collection and/or disclosure of your information via Third-Party Links, as a result of any reliance placed by you on the completeness, accuracy or existence of any advertising, products services, or other materials on, or available via such Third-Party Links.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights Section */}
          <section id="rights" className="scroll-mt-16">
            <div className="flex items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaUserCog className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-text-color">Your Rights & Choices</h2>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Communication Preferences</h3>
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="mb-4">We engage with you through various means, including:</p>
                  <div className="space-y-3 ml-6">
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Transmitting messages related to the Services you actively use, utilizing the email address associated with your account registration.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Depending on your preferences, disseminating marketing communications regarding Services that align with your interests.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Inviting your participation in research based on factors like your usage patterns of our Services.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Keeping you informed about our policies and terms of service.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Responding to your inquiries sent to us via email.</span>
                    </div>
                  </div>
                  <p className="mt-4">Additionally, we analyze how you interact with our messages, such as opening emails to gain insights into the most effective ways to communicate with you and to assess the helpfulness of our communications.</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaTrash className="text-red-600 mr-2" />
                  If You Want to Delete Your Information
                </h3>
                <div className="bg-secondary-bg-color-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">To delete content posted:</h4>
                      <p>We offer tools that you can use to delete certain information. For example, you can use delete buttons to delete content that you&apos;ve posted to your account. When you delete content, it&apos;s no longer visible to other users.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Permanently delete your account:</h4>
                      <div className="ml-6">
                        <div className="flex items-start">
                          <span className="text-gray-600 mr-2">•</span>
                          <span>If you delete your account on the Mobile App, we delete your information, including the things you&apos;ve posted, such as your photos and status updates, unless we need to keep it as described in <strong>&quot;How long do we keep your information?&quot;</strong> Once your account is permanently deleted, you won&apos;t be able to reactivate it, and you won&apos;t be able to retrieve information, including content you&apos;ve posted.</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-yellow-800">Please make a note that uninstalling the App will not result in any automatic deletion of your Personal Information or Sensitive Personal Data and Information.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaClock className="text-orange-600 mr-2" />
                  Deletion Timeframes
                </h3>
                <div className="bg-orange-50 rounded-lg p-6">
                  <p className="mb-4">If you ask us to delete your account or content, it could take up to ninety (90) days to erase your information once the account deletion process is initiated or when we receive a content deletion request. Subsequently, after the information is deleted, there might be an additional period of up to ninety (90) days for us to eliminate it from backups and disaster recovery.</p>
                  <h4 className="font-medium text-gray-800 mb-2 mt-4">How long do we keep your information?</h4>
                  <div className="ml-6">
                    <div className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span>We retain information for the duration required to deliver our Services.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span>Unless compelled to retain it for other purposes, such as legal obligations, we will proceed to delete the information.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaBalanceScale className="text-gray-600 mr-2" />
                  Policy Violations
                </h3>
                <div className="bg-secondary-bg-color-50 rounded-lg p-6">
                  <p>For example, if you post threatening or harmful content, we may share your information to protect ourselves and others. This may include blocking your access to certain features or disabling your account and in extreme cases, lead to barring your access to our Mobile App in the future.</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Changes to Your Information</h3>
                <div className="space-y-3">
                  <p>You have the option to review, rectify, update, or modify the information you have provided by logging into your account. However, you are not allowed to delete any portion of the personal information or any other data generated on the Mobile App. You may update your information at any point by writing to us at the details indicated below in the contact section.</p>
                  <p>We retain the right to verify and authenticate your identity and Personal Information to ensure the accurate delivery of Services. We may deny or restrict access to your Personal Information or the ability to correct, update, or delete it if doing so would infringe upon another person&apos;s rights or if it is not permitted by applicable law.</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Intellectual Property Rights</h3>
                <div className="bg-secondary-bg-color-50 rounded-lg p-6">
                  <p>All intellectual property rights, including copyrights, trademarks, patents, trade secrets, and any other proprietary rights related to the Mobile App and its content, are owned by the App owner or its licensors. Users of the App are not granted any license to use the intellectual property of the App owners or its licensors.</p>
                  <p className="mt-3">Users who contribute content to the Mobile App (such as comments, posts, or other audio-visual content) grant the Mobile App owner a worldwide, royalty-free, perpetual, irrevocable, and sub-licensable right to use, reproduce, modify, adapt, publish, translate, distribute, and display the contributed content in any media.</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Can Minors Use the App?</h3>
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-400">
                  <p>The use of the Mobile App is limited to individuals who are legally capable of entering into a binding contract under the Indian Contract Act, 1872. If you are below 18 years of age, please refrain from using or accessing the Service(s) in any way or at any time.</p>
                  <p className="mt-3">If we become aware that an individual under 18 years of age has used or accessed the Mobile App, or if personally identifiable information has been collected from individuals under 18 years of age on the Mobile App, we will take appropriate measures to delete such information.</p>
                </div>
              </div>
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4">Grievance Redressal</h3>
                <div className="bg-blue-600 text-primary-text-color p-6 rounded-lg">
                  <p className="mb-4">In accordance with Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below. If you have a query, concern, or complaint in relation to this Privacy Policy, please reach out to the Grievance Officer.</p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="text-blue-300 mr-2">•</span>
                      <span>Email address: <a href="mailto:support@bigshorts.co" className="underline">support@bigshorts.co</a></span>
                    </div>
                  </div>
                  <p className="mt-6 text-lg font-semibold">Last updated on 16/03/2024</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-bg-color text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src={logo.src} alt="logo" className="h-8 w-auto mb-2" />
              <div className="text-sm">© {new Date().getFullYear()} BigShorts. All rights reserved.</div>
            </div>
            <div className="space-x-6">
              <Link href="/Policy/childSafety" className="hover:text-primary-text-color transition-colors">Child Safety</Link>
              <Link href="/auth/login" className="hover:text-primary-text-color transition-colors">Sign In</Link>
              <Link href="/auth/sign-up" className="hover:text-primary-text-color transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;