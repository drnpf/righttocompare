import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Smartphone, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  phoneRecommendations?: {
    name: string;
    brand: string;
    reason: string;
    phoneId: string;
  }[];
}

interface AIChatWidgetProps {
  onNavigate?: (phoneId: string) => void;
}

export default function AIChatWidget({ onNavigate }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Load messages from localStorage or use default welcome message
  const getInitialMessages = (): Message[] => {
    try {
      const stored = localStorage.getItem('aiChatMessages');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    
    return [
      {
        id: "welcome",
        text: "Hi! I'm your AI phone assistant. I can help you find the perfect phone based on your needs. Just tell me what you're looking for!",
        sender: "ai",
        timestamp: new Date()
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aiChatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Samsung specific
    if (lowerMessage.includes("samsung") || lowerMessage.includes("galaxy")) {
      return {
        id: Date.now().toString(),
        text: "Samsung offers excellent Android flagship phones with innovative features:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "Galaxy S24 Ultra",
            brand: "Samsung",
            reason: "Top-tier flagship with S Pen, 200MP camera, and stunning display",
            phoneId: "galaxy-s24-ultra"
          }
        ]
      };
    }

    // Apple/iPhone specific
    if (lowerMessage.includes("iphone") || lowerMessage.includes("apple") || lowerMessage.includes("ios")) {
      return {
        id: Date.now().toString(),
        text: "Apple's iPhone lineup offers premium quality and seamless ecosystem integration:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            reason: "Titanium design, A17 Pro chip, and industry-leading camera system",
            phoneId: "iphone-15-pro-max"
          }
        ]
      };
    }

    // Budget-based recommendations
    if (lowerMessage.includes("budget") || lowerMessage.includes("cheap") || lowerMessage.includes("affordable") || lowerMessage.includes("under")) {
      return {
        id: Date.now().toString(),
        text: "Based on your budget requirements, I recommend these excellent value phones:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "Galaxy S24 Ultra",
            brand: "Samsung",
            reason: "Flagship features at competitive pricing with excellent camera system",
            phoneId: "galaxy-s24-ultra"
          },
          {
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            reason: "Premium build quality and long-term software support",
            phoneId: "iphone-15-pro-max"
          }
        ]
      };
    }

    // Camera-focused recommendations
    if (lowerMessage.includes("camera") || lowerMessage.includes("photo") || lowerMessage.includes("photography") || lowerMessage.includes("picture")) {
      return {
        id: Date.now().toString(),
        text: "For photography enthusiasts, these phones offer exceptional camera systems:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "Galaxy S24 Ultra",
            brand: "Samsung",
            reason: "200MP main camera with advanced AI processing and 100x Space Zoom",
            phoneId: "galaxy-s24-ultra"
          },
          {
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            reason: "Industry-leading computational photography and ProRAW support",
            phoneId: "iphone-15-pro-max"
          }
        ]
      };
    }

    // Gaming recommendations
    if (lowerMessage.includes("gaming") || lowerMessage.includes("game") || lowerMessage.includes("performance") || lowerMessage.includes("fast")) {
      return {
        id: Date.now().toString(),
        text: "For gaming and peak performance, check out these powerhouses:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "Galaxy S24 Ultra",
            brand: "Samsung",
            reason: "Snapdragon 8 Gen 3 processor with advanced cooling system",
            phoneId: "galaxy-s24-ultra"
          },
          {
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            reason: "A17 Pro chip with hardware ray tracing for console-quality gaming",
            phoneId: "iphone-15-pro-max"
          }
        ]
      };
    }

    // Battery life recommendations
    if (lowerMessage.includes("battery") || lowerMessage.includes("charge") || lowerMessage.includes("long lasting") || lowerMessage.includes("all day")) {
      return {
        id: Date.now().toString(),
        text: "These phones excel in battery life and charging capabilities:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "Galaxy S24 Ultra",
            brand: "Samsung",
            reason: "5000mAh battery with 45W fast charging and power efficiency",
            phoneId: "galaxy-s24-ultra"
          },
          {
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            reason: "All-day battery life with optimized iOS power management",
            phoneId: "iphone-15-pro-max"
          }
        ]
      };
    }

    // Display/Screen recommendations
    if (lowerMessage.includes("display") || lowerMessage.includes("screen") || lowerMessage.includes("amoled")) {
      return {
        id: Date.now().toString(),
        text: "These phones feature stunning displays perfect for media consumption:",
        sender: "ai",
        timestamp: new Date(),
        phoneRecommendations: [
          {
            name: "Galaxy S24 Ultra",
            brand: "Samsung",
            reason: "6.8-inch Dynamic AMOLED 2X display with 120Hz and peak brightness of 2600 nits",
            phoneId: "galaxy-s24-ultra"
          },
          {
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            reason: "Super Retina XDR display with ProMotion technology up to 120Hz",
            phoneId: "iphone-15-pro-max"
          }
        ]
      };
    }

    // Default recommendation
    return {
      id: Date.now().toString(),
      text: "Here are some of the best phones available right now that offer excellent overall value:",
      sender: "ai",
      timestamp: new Date(),
      phoneRecommendations: [
        {
          name: "Galaxy S24 Ultra",
          brand: "Samsung",
          reason: "Top-tier flagship with S Pen, incredible cameras, and powerful performance",
          phoneId: "galaxy-s24-ultra"
        },
        {
          name: "iPhone 15 Pro Max",
          brand: "Apple",
          reason: "Premium iOS experience with titanium build and advanced features",
          phoneId: "iphone-15-pro-max"
        }
      ]
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePhoneClick = (phoneId: string) => {
    onNavigate?.(phoneId);
    toast.success("Opening phone details...");
  };

  const handleClearChat = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: "Hi! I'm your AI phone assistant. I can help you find the perfect phone based on your needs. Just tell me what you're looking for!",
      sender: "ai",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    toast.success("Chat history cleared");
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all group animate-pulse-glow"
          >
            <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              <Sparkles size={12} />
            </div>
            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#1e1e1e] text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-sm">
              Ask AI for phone recommendations
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#1e1e1e]"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-50 w-[420px] h-[600px] bg-white dark:bg-[#161b26] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e5e5e5] dark:border-[#2d3548]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] dark:from-[#4a7cf6] dark:to-[#5d8cf7] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-white">AI Phone Assistant</h3>
                  <p className="text-white/80 text-xs">Powered by AI recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  title="Clear chat history"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f7f7] dark:bg-[#0d1117]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] dark:from-[#4a7cf6] dark:to-[#5d8cf7] text-white"
                        : "bg-white dark:bg-[#1a1f2e] border border-[#e5e5e5] dark:border-[#2d3548] text-[#1e1e1e] dark:text-white"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] dark:from-[#4a7cf6] dark:to-[#5d8cf7] rounded-full p-1">
                          <Sparkles size={12} className="text-white" />
                        </div>
                        <span className="text-xs text-[#666] dark:text-[#a0a8b8]">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>

                    {/* Phone Recommendations */}
                    {message.phoneRecommendations && (
                      <div className="mt-3 space-y-2">
                        {message.phoneRecommendations.map((phone, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePhoneClick(phone.phoneId)}
                            className="w-full bg-[#f7f7f7] dark:bg-[#161b26] hover:bg-[#ececec] dark:hover:bg-[#1e2530] border border-[#e5e5e5] dark:border-[#2d3548] rounded-lg p-3 text-left transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-[#2c3968] to-[#3d4a7a] dark:from-[#4a7cf6] dark:to-[#5d8cf7] rounded-lg p-2 shrink-0">
                                <Smartphone size={16} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#1e1e1e] dark:text-white mb-1 group-hover:text-[#2c3968] dark:group-hover:text-[#4a7cf6] transition-colors">
                                  {phone.brand} {phone.name}
                                </p>
                                <p className="text-xs text-[#666] dark:text-[#a0a8b8] leading-relaxed">{phone.reason}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs mt-2 opacity-50">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#2c3968] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-[#2c3968] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-[#2c3968] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                      <span className="text-xs text-[#666]">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-[#e5e5e5] p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask for phone recommendations..."
                  className="flex-1 px-4 py-3 rounded-xl border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all text-sm"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-xl px-4 py-3 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setInputValue("Best camera phones");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-3 py-1.5 bg-[#f7f7f7] hover:bg-[#ececec] rounded-full text-[#666] hover:text-[#2c3968] transition-all"
                  disabled={isTyping}
                >
                  📸 Camera
                </button>
                <button
                  onClick={() => {
                    setInputValue("Gaming phones");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-3 py-1.5 bg-[#f7f7f7] hover:bg-[#ececec] rounded-full text-[#666] hover:text-[#2c3968] transition-all"
                  disabled={isTyping}
                >
                  🎮 Gaming
                </button>
                <button
                  onClick={() => {
                    setInputValue("Long battery life");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-3 py-1.5 bg-[#f7f7f7] hover:bg-[#ececec] rounded-full text-[#666] hover:text-[#2c3968] transition-all"
                  disabled={isTyping}
                >
                  🔋 Battery
                </button>
                <button
                  onClick={() => {
                    setInputValue("Budget phones");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs px-3 py-1.5 bg-[#f7f7f7] hover:bg-[#ececec] rounded-full text-[#666] hover:text-[#2c3968] transition-all"
                  disabled={isTyping}
                >
                  💰 Budget
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
