// File: app/home/childSafety/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logo from '@/assets/logo.svg';
import Button from '@/components/shared/Button';
import { FaArrowLeft, FaShieldAlt, FaRegBell, FaUserShield, FaBook, FaExclamationTriangle, FaCheck, FaSearch } from 'react-icons/fa';
import SafeImage from '@/components/shared/SafeImage';

const ChildSafetyPage: React.FC = () => {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("commitment");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleTabClick = (tabId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tabId);
    document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Set active tab based on scroll position
    const handleScroll = () => {
      const sections = ["commitment", "guidelines", "reporting", "resources", "faq"];

      // Find the section that's currently most visible in the viewport
      let currentSection = activeTab;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section is in the top half of the viewport
          if (rect.top <= 150 && rect.bottom > 150) {
            currentSection = section;
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
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-bg-color to-bg-color text-text-color">
      {/* Hero Section */}
      <div className="bg-blue-600 text-primary-text-color py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 bg-blue-700 rounded-full mb-6">
            <FaShieldAlt className="text-4xl" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Child Safety Policy</h1>
          <div className="text-xl max-w-3xl mx-auto">
            Creating a safe online environment for everyone, with special protection for our youngest users
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-primary-bg-color border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex overflow-x-auto py-2 px-4 space-x-6">
          <button
            onClick={handleTabClick("commitment")}
            className={`whitespace-nowrap font-medium px-1 py-3 border-b-2 transition-colors ${activeTab === "commitment" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            Our Commitment
          </button>
          <button
            onClick={handleTabClick("guidelines")}
            className={`whitespace-nowrap font-medium px-1 py-3 border-b-2 transition-colors ${activeTab === "guidelines" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            Guidelines
          </button>
          <button
            onClick={handleTabClick("reporting")}
            className={`whitespace-nowrap font-medium px-1 py-3 border-b-2 transition-colors ${activeTab === "reporting" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            Reporting
          </button>
          <button
            onClick={handleTabClick("resources")}
            className={`whitespace-nowrap font-medium px-1 py-3 border-b-2 transition-colors ${activeTab === "resources" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            Resources
          </button>
          <button
            onClick={handleTabClick("faq")}
            className={`whitespace-nowrap font-medium px-1 py-3 border-b-2 transition-colors ${activeTab === "faq" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            FAQ
          </button>
        </div >
      </div >

      {/* Main Content */}
      < main className="max-w-4xl mx-auto px-4 py-12" >
        <div className="bg-primary-bg-color rounded-xl shadow-lg overflow-hidden">
          {/* Our Commitment */}
          <section id="commitment" className="p-8 border-b">
            <div className="flex items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaShieldAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Commitment to Child Safety</h2>
                <div className="text-gray-600 space-y-4">
                  <div>
                    We are committed to providing a safe and secure environment for all users, with special attention to the safety and well-being of children using our platform.
                  </div>
                  <div>
                    This policy outlines the measures we take to protect children and the expectations we have for all users to maintain a safe community.
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-semibold mb-3">Age Requirements</h3>
              <div className="text-gray-600">
                Users must be at least 13 years of age to create an account on our platform. Users between the ages of 13 and 18 must have parental or guardian consent to use our services.
              </div>
            </div>
          </section >
          {/* Content Guidelines */}
          < section id="guidelines" className="p-8 border-b" >
            <div className="flex items-start mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Guidelines</h2>
                <div className="text-gray-600 mb-4">
                  We strictly prohibit content that exploits or endangers children. This includes but is not limited to:
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-red-50 rounded-lg p-5">
                <div className="font-medium text-red-700 mb-2">Prohibited Content:</div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">Content that sexualizes minors in any way</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">Content that depicts, encourages, or normalizes violence against children</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">Content that reveals personal information of minors</span>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-5">
                <div className="font-medium text-red-700 mb-2">Also Prohibited:</div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">Content that bullies, harasses, or intimidates children</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">Content that promotes dangerous activities that could lead to physical harm</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">Content that attempts to groom or manipulate minors</span>
                  </div>
                </div>
              </div>
            </div >
          </section >
          {/* Reporting Violations */}
          < section id="reporting" className="p-8 border-b" >
            <div className="flex items-start mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaRegBell className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reporting Violations</h2>
                <div className="text-gray-600 mb-4">
                  If you encounter content that violates our child safety policy, please report it immediately. We provide multiple ways to report concerns:
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-bg-color p-2 rounded-full mr-3 shadow-sm">
                    <FaCheck className="text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Use the &quot;Report&quot; button</div>
                    <div className="text-gray-600 text-sm">Available on all content across our platform</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-bg-color p-2 rounded-full mr-3 shadow-sm">
                    <FaCheck className="text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Contact our dedicated safety team</div>
                    <div className="text-gray-600 text-sm">Email: <a href="mailto:safety@bigshorts.co" className="text-blue-600 hover:underline">safety@bigshorts.co</a></div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-bg-color p-2 rounded-full mr-3 shadow-sm">
                    <FaCheck className="text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">For urgent matters</div>
                    <div className="text-gray-600 text-sm">Contact our 24/7 safety hotline or use in-app emergency reporting</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center text-green-700 font-medium">
                All reports are handled confidentially and investigated promptly
              </div>
            </div >
          </section >

          {/* Resources */}
          < section id="resources" className="p-8 border-b" >
            <div className="flex items-start mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaBook className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Education and Resources</h2>
                <div className="text-gray-600">
                  Knowledge is key to prevention. We provide educational materials and external resources for children, parents, and educators:
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mt-6 space-y-4">
              <div>
                <div className="font-medium text-purple-700">Parental Guides</div>
                <div className="text-gray-600 text-sm">How to help your child navigate the internet safely.</div>
              </div>
              <div>
                <div className="font-medium text-purple-700">Safety Education for Kids</div>
                <div className="text-gray-600 text-sm">Interactive lessons and tools to build awareness about online safety.</div>
              </div>
              <div>
                <div className="font-medium text-purple-700">Partner Organizations</div>
                <div className="text-gray-600 text-sm">
                  Visit <a href="https://www.missingkids.org/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">missingkids.org</a> or <a href="https://www.thorn.org/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">thorn.org</a> to learn more.
                </div>
              </div>
            </div>
          </section >

          {/* FAQ */}
          <section id="faq" className="p-8" >
            <div className="flex items-start mb-6">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaSearch className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
                <div className="text-gray-600">Common questions about our child safety policies and reporting system.</div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {[
                {
                  question: "What happens after I report a video?",
                  answer: "Our safety team reviews every report within 24 hours. If the content violates our policy, it is promptly removed and further action may be taken."
                },
                {
                  question: "Can I report anonymously?",
                  answer: "Yes, you can report content without revealing your identity. However, providing context may help us investigate better."
                },
                {
                  question: "How do you verify the age of users?",
                  answer: "We use a combination of AI-based detection, verification processes, and community reporting to detect underage accounts."
                }
              ].map((item, index) => (
                <div key={index} className="py-4">
                  <button
                    className="w-full text-left font-medium text-gray-800 flex justify-between items-center"
                    onClick={() => toggleFaq(index)}
                  >
                    {item.question}
                    <span className="text-xl">{activeFaq === index ? "−" : "+"}</span>
                  </button>
                  {activeFaq === index && (
                    <div className="mt-2 text-gray-600">{item.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          < section id="faq" className="p-8" >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {[
                {
                  question: "How can I set up parental controls?",
                  answer: "You can access parental controls through Settings > Privacy > Parental Controls. From there, you can set content restrictions, screen time limits, and approve connections."
                },
                {
                  question: "What should I do if my child receives inappropriate messages?",
                  answer: "First, tell your child not to respond. Take screenshots as evidence, report the user through our reporting system, and block the account. Contact our safety team at safety@bigshorts.co with details."
                },
                {
                  question: "At what age can my child create an account?",
                  answer: "Users must be at least 13 years old to create an account. Users between 13-18 years need parental consent, and we offer special protections for teen accounts."
                },
                {
                  question: "How do you verify users' ages?",
                  answer: "We use a combination of self-reporting, automated detection systems, and periodic reviews. If we suspect an underage user, we may request age verification or restrict account access."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left p-4 flex justify-between items-center bg-secondary-bg-color-50 hover:bg-secondary-bg-color transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <span className={`transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  {
                    activeFaq === index && (
                      <div className="p-4 bg-primary-bg-color">
                        <div className="text-gray-600">{faq.answer}</div>
                      </div>
                    )}
                </div>
              ))
              }
            </div >
          </section >
        </div >

        {/* Contact Section */}
        < div className="mt-12 bg-blue-600 text-primary-text-color rounded-xl p-8 text-center shadow-lg" >
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <div className="max-w-lg mx-auto mb-6">
            Our dedicated safety team is available 24/7 to address any concerns about child safety on our platform.
          </div>
          <div className="mb-6">
            <div className="text-xl font-medium">Contact us at:</div>
            <a href="mailto:support@bigshorts.co" className="text-primary-text-color underline text-lg">support@bigshorts.co</a>
          </div >
          <div className="flex justify-center">
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-primary-bg-color text-blue-600 hover:bg-blue-50 px-6 py-3"
            >
              Back to Login
            </Button>
          </div>
        </div >
      </main >

      {/* Footer */}
      < footer className="bg-secondary-bg-color text-gray-400 py-8" >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src={logo.src} alt="logo" className="h-8 w-auto mb-2" />
              <div className="text-sm">© {new Date().getFullYear()} BigShorts. All rights reserved.</div>
            </div>
            <div className="space-x-6">
              <Link href="/Policy/privacyPolicy" className="hover:text-primary-text-color transition-colors">Privacy Policy</Link>
              <Link href="/auth/login" className="hover:text-primary-text-color transition-colors">Sign In</Link>
              <Link href="/auth/sign-up" className="hover:text-primary-text-color transition-colors">Sign Up</Link>
            </div >
          </div >
        </div >
      </footer >
    </div >
  );
};

export default ChildSafetyPage