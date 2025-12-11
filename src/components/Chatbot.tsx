import { useState, useRef, useEffect } from 'react';
import { FaArrowAltCircleUp, FaChevronDown, FaHome, FaEnvelope } from "react-icons/fa";
import { FiMessageCircle } from 'react-icons/fi';
import { Button, Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import { FaChevronRight } from 'react-icons/fa';
import { Send, Home, MessageCircle, HelpCircle, Phone, Mail, Calendar, ChevronRight, Wrench } from 'lucide-react';


type Message = {
  type: 'bot' | 'user';
  text: string;
  feedback: string | null;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [screen, setScreen] = useState<'intro' | 'chat'>('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [botBusy, setBotBusy] = useState(false);

  const [userId] = useState(() => {
    const existing = sessionStorage.getItem("user_id");
    if (existing) return existing;
    const random = `user_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem("user_id", random);
    return random;
  });

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`chat_messages_${userId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [userId]);

  const userName = (sessionStorage.getItem("chat_name") || "Guest").charAt(0).toUpperCase() + (sessionStorage.getItem("chat_name") || "Guest").slice(1);

  const helpOptions = [
    "How can RGP help my local business get more customers?",
    "What's the biggest difference between RGP's AI tools and regular marketing",
    "Can you check if my business is showing up on Google searches?",
    "What happens if I miss calls or messages from new leads?",
    "How do I book a quick call with your team to see if this works for me?"
  ];

  useEffect(() => {
    setScreen("chat");
  }, [isOpen]);

  const handleBotResponse = async (userMessage: string) => {
    setBotBusy(true);
    setTypingMessage("Adam is typing...");

    try {
      const res = await fetch("https://auto.robogrowthpartners.com/webhook/lead-qualification-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: userMessage })
      });

      const data = await res.json();
      const replies = (data.reply || "").split("\\k").filter((part: string) => part.trim() !== "");

      for (let i = 0; i < replies.length; i++) {
        setTypingMessage("Adam is typing...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTypingMessage(null);
        setMessages(prev => [...prev, { type: 'bot', text: replies[i].trim(), feedback: null }]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch {
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: "Oops! Something went wrong.", feedback: null }]);
    }

    setBotBusy(false);
    setMessageQueue(prev => {
      const [nextMessage, ...rest] = prev;
      if (nextMessage) {
        setTimeout(() => {
          handleBotResponse(nextMessage);
        }, 2000);
      }
      return rest;
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: message, feedback: null }]);

    if (botBusy) {
      setMessageQueue(prev => [...prev, message]);
    } else {
      await handleBotResponse(message);
    }
  };

  const handleHelpClick = (prompt: string) => {
    setScreen("chat");
    handleBotResponse(prompt);
  };



  // Function to handle direct messaging without form
  const [firstMessageSent, setFirstMessageSent] = useState(() => {
    return sessionStorage.getItem("first_message_sent") === "true";
  });

  const handleDirectMessage = () => {
    setScreen("chat");

    if (firstMessageSent) return; // prevent re-sending

    const storedName = sessionStorage.getItem("chat_name");
    const storedEmail = sessionStorage.getItem("chat_email");

    if (!storedName || !storedEmail) {
      handleBotResponse("Hello, I'd like to start a conversation.");
    }

    setFirstMessageSent(true);
    sessionStorage.setItem("first_message_sent", "true");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  // AUTO SEND FIRST BOT MESSAGE WHEN CHAT OPENS
  useEffect(() => {
    if (isOpen && screen === "chat" && !firstMessageSent) {
      handleBotResponse("Hello, I'd like to start a conversation.");
      setFirstMessageSent(true);
      sessionStorage.setItem("first_message_sent", "true");
    }
  }, [isOpen, screen, firstMessageSent]);

  const faqData = [
    {
      question: "What is Robo Growth Partners?",
      answer: "Robo Growth Partners is a growth consultancy dedicated to local service businesses, combining proven marketing strategies with AI automation to help contractors, medical practices, legal firms, and other service‑based companies dominate their local markets."
    },
    {
      question: "What services do you offer?",
      answer: "We offer integrated services including Google Map Pack Rankings, Custom AI Agents (voice & SMS) for lead qualification, WordPress website development, Web & Funnel GEO optimization, AI‑powered social media management, and Google review management  all designed to boost local visibility and lead conversion. "
    },
    {
      question: "How quickly can I expect to see results?",
      answer: "Most clients see measurable improvements within 2 4 weeks. You’ll typically notice more phone calls, better Google rankings, and higher lead conversion rates within your first month, with results compounding over time."
    },
    {
      question: "Do I need to understand AI or technology to work with you?",
      answer: "Not at all. We handle all technical setup and automation  our systems run in the background while you focus on your core business. We’ll also train you on any interface you need to access."
    },
    {
      question: "Can you work with my existing website?",
      answer: "Yes. If your current website meets basic technical standards (speed, mobile optimization, local‑SEO readiness), we can work with it. If not, we may recommend building a new WordPress site for best results."
    },
    {
      question: "Who are your services designed for?",
      answer: "We specialize in local service businesses: HVAC, plumbing, electrical, home services, medical practices, dental offices, law firms, accounting, and other professional or trade‑based services that rely on local customers."
    },
    {
      question: "How do you measure success?",
      answer: "We track metrics that matter  increased phone calls, improved 'Map Pack' rankings, higher lead conversion rates, more positive reviews, stronger online visibility, and ultimately revenue growth. You'll get transparent reporting so you see exactly how marketing efforts translate to business results."
    },
    {
      question: "Do I need to commit long‑term?",
      answer: "We believe in delivering value, not locking clients into lengthy contracts. We typically recommend a minimum 90‑day commitment to see meaningful results, but beyond that we focus on performance and results  not contracts."
    },
    {
      question: "Can you guarantee first‑page Google rankings?",
      answer: "No  we can’t guarantee specific rankings because search algorithms (like Google’s) change frequently. What we DO guarantee is our proven process, dedicated effort, and transparent reporting. Most clients see significant improvements within 30 60 days."
    },
    {
      question: "What if my business is seasonal?",
      answer: "That’s fine. We’ve helped many clients with seasonal demand fluctuations. We adjust our marketing strategies accordingly: ramp up during peak seasons and maintain baseline visibility during slower periods so you don’t miss opportunities."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            bottom: '-0px',
            right: '0px',
            zIndex: 10000,
          }}
        >
          <Card style={{ width: '400px', height: '590px', display: 'flex', flexDirection: 'column', borderRadius: "30px", overflow: "hidden" }}>

            {/* Modern Header */}
            <div className={screen === 'intro' || screen === 'form' ? '' : ''} style={{
              background: "linear-gradient(135deg, #2f3155ff, #5296e9ff)",
              padding: '20px',
              paddingTop: "20px",
              color: 'white',
              minHeight: "10px"
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src="./logo.png"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '10px'
                  }}
                />
                <h3 style={{
                  margin: 0,
                  fontFamily: "",
                  fontSize: "25px",
                  fontWeight: "bold"
                }}>
                  <b>AI Assistant</b>
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              </div>
              <>

                <p style={{
                  margin: 0,
                  fontSize: 15,
                  paddingTop: '10px',
                  paddingRight: "10px"
                }}>
                  Hi, I’m <b>Adam</b> from <b>RoboGrowth</b>. How can we help?
                </p>
              </>

            </div>

            {/* Main Body */}
            <Card.Body style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>

              {screen === 'intro' && (
                <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
                  <h5 style={{ textAlign: "center", marginBottom: "20px", fontWeight: "600", fontSize: "18px" }}>Frequently Asked Questions</h5>
                  {faqData.map((faq, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #ecebeb",
                        borderRadius: "10px",
                        marginBottom: "12px",
                        overflow: "hidden",
                        boxShadow: openIndex === index ? "0 4px 12px rgba(0,0,0,0.1)" : "0 2px 6px rgba(0,0,0,0.05)",
                        transition: "box-shadow 0.3s ease",
                      }}
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        style={{
                          width: "100%",
                          background: "#ffffff",
                          border: "none",
                          padding: "12px 20px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          outline: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {faq.question}
                        <span style={{ transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
                      </button>
                      <div
                        style={{
                          maxHeight: openIndex === index ? "500px" : "0",
                          transition: "max-height 0.4s ease, padding 0.4s ease",
                          padding: openIndex === index ? "10px 20px 15px" : "0 20px",
                          background: "#fafafa",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}



              {screen === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px' }}>
                    {messages.map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>

                        <div style={{
                          maxWidth: '75%',
                          paddingLeft: '15px',
                          paddingTop: '10px',
                          paddingRight: '13px',
                          borderRadius: '30px',
                          borderBottomLeftRadius: msg.type === 'user' ? "30px":"0px",
                          borderBottomRightRadius: msg.type === 'user' ? "0px":"30px",
                          color: msg.type === 'user' ? 'white' : 'black',
                          background: msg.type === 'user' ? 'linear-gradient(135deg, #2a2d61, #2c5383)' : '#f1f1f1',
                          fontSize: "14px"
                        }}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {typingMessage && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    display: 'flex',
                    padding: '8px',
                    boxShadow: "0 -4px 10px -4px #dfdfdf8a",
                    background: '#fff'
                  }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      style={{
                        marginLeft: '8px',
                        borderRadius: '50%',
                        background: "linear-gradient(135deg, #2a2d61, #2c5383)",
                        width: '40px',
                        border: "none",
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaArrowAltCircleUp size={20} />
                    </Button>
                  </div>
                </div>
              )}

            </Card.Body>

            <Card.Footer
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0',
                borderTop: '1px solid #ddd',
                background: '#f8f9fa',
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 500,
                boxShadow: (screen === 'intro') ? "0 5px 10px #b3b3b3ff" : "none"
              }}
            >
              {[
                { icon: FaEnvelope, label: "Chat", screenName: 'chat' },

                { icon: HelpCircle, label: 'FAQ', screenName: 'intro' },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = screen === item.screenName;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: isActive ? '#2c5383' : '#555',
                      padding: '5px 10px',
                      borderRadius: '8px'
                    }}
                    onClick={() => {
                      if (item.screenName === 'chat') {
                        // Go directly to chat without requiring form
                        handleDirectMessage();
                      } else if (item.screenName) {
                        setScreen(item.screenName);
                      }
                    }}
                  >
                    <Icon size={22} style={{ transition: 'color 0.3s ease' }} />
                    <div style={{ fontSize: 12, marginTop: 2 }}>{item.label}</div>
                  </motion.div>
                );
              })}
            </Card.Footer>

          </Card>
        </motion.div>
      )}
    </>
  );
};

export default Chatbot;