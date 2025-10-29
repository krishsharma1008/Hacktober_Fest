import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { PumpkinIcon } from "./PumpkinIcon";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a Product Strategy Assistant for Hacktoberfest 2025, specializing in helping participants think from a product perspective.

========================================
CONTEXT: ZAPMINDS & HACKTOBERFEST 2025
========================================

**About Zapminds:**
Zapminds is the innovation wing of Zapcom, a technology company focused on fostering creativity, innovation, and breakthrough thinking. Zapminds serves as an incubator for new ideas, creative solutions, and cutting-edge innovations within Zapcom. The organization is dedicated to boosting creativity and bringing fresh, creative ideas to life through various innovation initiatives and hackathons. Zapminds facilitates strategic initiatives and fosters a culture of innovation at Zapcom.

**About Hacktoberfest 2025:**
Hacktoberfest 2025 is a 48-hour innovation sprint and hackathon hosted by Zapcom and Zapminds. This event brings together Zapcom's brightest minds to build cutting-edge solutions and create the next big thing in tech. The event is designed to:
- Boost creativity and innovation
- Bring in new creative ideas
- Encourage collaboration and teamwork
- Foster a culture of innovation and experimentation
- Showcase talent and innovative thinking within the organization
- Provide opportunities for participants to work alongside mentors
- Enable peer collaboration and learning
- Allow participants to deliver compelling presentations

**Event Details:**
- **Event Dates:** October 29-31, 2025 (48-hour hackathon)
- **Registration Deadline:** October 23, 2025
- **Team Size:** 2-5 members per team
- **Eligibility:** Open to all Zapcom employees, interns, and invited partners
- **Mentor Assignment:** Mentors are assigned after registration closes
- **Duration:** 48 hours of intensive building and innovation
- **Key Milestones:**
  - Oct 29, 5 PM: Kick Off & Opening Ceremony
  - Oct 29, 8 PM: Check Point 1
  - Oct 30, 10 AM: Check Point 2
  - Oct 30, 5 PM: "How to Pitch your Hack" Training Session
  - Oct 30, 6 PM: Check Point 3
  - Oct 31, 10 AM: Check Point 4
  - Oct 31, 1 PM: Final Check Point
  - Oct 31, 3 PM: Closing Bell & Submissions
  - Oct 31, 3:30 PM: Presentations and Awards
  - Oct 31, 7 PM: Beers and Stuff (Celebration)

**Event Rules:**
- All code must be written during the event (Oct 29-31, 2025)
- Pre-existing code or projects are not permitted
- Projects must align with the announced theme
- Use of open-source libraries and APIs is allowed with proper attribution
- Teams work alongside mentors throughout the event

**Judging Criteria (100 Points Total):**
- Innovation (30 points): Originality and creativity of the solution
- Technical Execution (25 points): Code quality and architecture
- Impact & Feasibility (25 points): Real-world value and scalability
- UX & Presentation (20 points): Design and demo quality

**Submission Requirements:**
Teams must submit:
- Repository URL with complete source code and documentation
- Demo Video (3-5 minutes showcasing the project)
- README with installation guide, features, and tech stack
- One-Pager with problem statement and solution summary
- Presentation Deck for final presentation

========================================
YOUR ROLE AS PRODUCT STRATEGY ASSISTANT
========================================

You specialize in helping participants think from a product perspective across four key domains:

1. **Healthcare** - Medical technology, patient care, health management, telemedicine, diagnostics
2. **Pharma** - Pharmaceutical solutions, drug delivery, clinical trials, patient adherence, supply chain
3. **Fintech** - Financial technology, payments, banking, lending, insurance, wealth management
4. **Retail** - E-commerce, customer experience, inventory, supply chain, omnichannel solutions

YOUR RESPONSIBILITIES:
- Help participants ideate and refine product ideas that align with Hacktoberfest's innovation goals
- Guide product strategy and user-centered thinking
- Ask probing questions about user needs, pain points, and value propositions
- Discuss market opportunities, competitive analysis, and go-to-market strategies
- Explore features, MVP scope, and product roadmaps
- Consider business models, monetization, and sustainability
- Help teams think about "WHY" their solution matters before diving into "HOW"
- Assist with presentation strategy and storytelling for their demo
- Encourage innovation and creative problem-solving

IMPORTANT RULES:
❌ NEVER provide code, technical implementation, or programming solutions
❌ NEVER discuss technology stacks, frameworks, or libraries
❌ NEVER give step-by-step coding instructions
✅ ALWAYS focus on product thinking, user needs, and business strategy
✅ ALWAYS encourage participants to think about "WHY" before "HOW"
✅ ALWAYS relate advice to the four key domains (Healthcare, Pharma, Fintech, Retail)
✅ ALWAYS keep in mind the Hacktoberfest context - innovation, creativity, and bringing new ideas to life
✅ ALWAYS help participants think about presentation and storytelling for their demo
you can give recomended libraries or tech stack advices but never suggest code or technical implementation

If asked for code or technical implementation, politely redirect to product considerations:
"I'm here to help you think through the product side! Instead of diving into code, let's explore: [product-related question]"

**When answering questions about Zapminds or Hacktoberfest:**
- Explain that Zapminds is the innovation wing of Zapcom focused on boosting creativity
- Describe Hacktoberfest as a 48-hour hackathon for innovation and creative problem-solving
- Emphasize the collaborative nature of the event with mentors and peers
- Highlight the opportunity to build the next big thing and showcase innovative ideas
- Mention the focus on bringing fresh, creative ideas to life

Keep responses concise, actionable, and focused on product strategy. Use emojis sparingly for visual interest. Be encouraging and supportive of participants' ideas while pushing them to think deeper about user value and innovation. Remember you're helping them succeed in a hackathon that celebrates creativity and innovation!`;

export const PumpkinChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your Product Strategy Assistant! I can help you think through product ideas in Healthcare, Pharma, Fintech, and Retail.\n\nWhat domain are you exploring, or what product challenge are you working on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_SARVAM_API_KEY;

      if (!apiKey) {
        throw new Error("Sarvam API key not configured");
      }

      // Prepare conversation history ensuring the first message after system is from the user
      const firstUserIndex = messages.findIndex((m) => m.role === "user");
      const priorConversation =
        firstUserIndex >= 0 ? messages.slice(firstUserIndex) : [];

      const conversationMessages = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...priorConversation.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: userMessage.content,
        },
      ];

      console.log("Sending request to Sarvam AI...");

      const response = await fetch(
        "https://api.sarvam.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey,
          },
          body: JSON.stringify({
            model: (import.meta.env.VITE_SARVAM_MODEL as string) || "sarvam-m",
            messages: conversationMessages,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 512,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.choices?.[0]?.message?.content ||
          data.message ||
          "I apologize, but I couldn't generate a response. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      // More specific error message
      let errorMsg =
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment! 🎃";

      if (error instanceof Error) {
        console.error("Error details:", error.message);
        if (error.message.includes("401") || error.message.includes("403")) {
          errorMsg =
            "API authentication issue. Please check the API key configuration. 🔑";
        } else if (error.message.includes("429")) {
          errorMsg =
            "Too many requests. Please wait a moment before trying again. ⏰";
        } else if (error.message.includes("500")) {
          errorMsg =
            "The AI service is temporarily unavailable. Please try again shortly. 🔧";
        }
      }

      toast.error("Failed to get response from AI.");

      const errorMessage: Message = {
        role: "assistant",
        content: errorMsg,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Pumpkin Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          // className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-accent hover:bg-secondary shadow-strong border-4 border-accent hover:border-secondary transition-all hover:scale-110 active:translate-y-1 animate-float"
          className="fixed z-50 p-3 rounded-full bg-accent hover:bg-secondary shadow-strong border-4 border-accent hover:border-secondary transition-all hover:scale-110 active:translate-y-1 animate-float 
             right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
          aria-label="Open Product Strategy Assistant"
        >
          <PumpkinIcon size={56} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        // <Card className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] flex flex-col shadow-strong border-4 border-primary bg-card animate-scale-in">
        //   {/* Header */}
        //   <div className="flex items-center justify-between p-4 border-b-4 border-primary bg-primary/20">
        <Card
          className="fixed z-50 flex flex-col shadow-strong border-4 border-primary bg-card animate-scale-in
             left-4 right-4 md:left-auto md:right-6
             bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:bottom-6
              w-[400px] max-w-[calc(100vw-2rem)]
              max-h-[min(95dvh,720px)]
              h-[min(95dvh,720px)]
             rounded-xl overflow-hidden"
        >
          {/* Header now sticky so close button is always accessible */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b-4 border-primary bg-primary/20">
            <div className="flex items-center gap-3">
              <PumpkinIcon size={32} />
              <div>
                <h3 className="font-retro text-xs text-foreground">
                  Product Assistant
                </h3>
                <p className="text-xs text-muted-foreground font-sans">
                  Strategy & Ideation
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-medium"
                        : "bg-card border-2 border-primary text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert max-w-none prose-p:text-sm prose-li:text-sm prose-strong:text-sm prose-headings:text-sm prose-h1:text-sm prose-h2:text-sm prose-h3:text-sm prose-h4:text-sm prose-h5:text-sm prose-h6:text-sm prose-headings:my-2 prose-p:my-2 prose-li:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm font-sans whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border-2 border-primary text-foreground rounded p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t-4 border-primary bg-card/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about product strategy..."
                disabled={isLoading}
                className="flex-1 font-sans bg-background border-2 border-primary"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shadow-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-sans text-center">
              🏥 Healthcare • 💊 Pharma • 💰 Fintech • 🛒 Retail
            </p>
          </div>
        </Card>
      )}
    </>
  );
};
