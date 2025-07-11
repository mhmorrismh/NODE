"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { X, Upload } from "lucide-react";
import { cn } from "~/lib/utils";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import { CoffeeProductView } from "./coffee-product-view";

// Construct the API URL with fallback
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://combative-seahorse-878.convex.cloud";
const CONVEX_SITE_URL = CONVEX_URL.replace(/.cloud$/, ".site");

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ⚠️ PROMPT ENGINEERING SECTION - EDIT THIS TO CUSTOMIZE AI BEHAVIOR ⚠️
const COFFEE_ANALYSIS_PROMPT = `The coffee bean package shows a roast level, 5 circles between "LIGHT" and "DARK" on the package. Indicate the roast level as X/5.`;

const FOLLOW_UP_ANALYSIS_PROMPT = `STEP 1 - VALIDATION:
If the NODE logo (dark navy blue, circular, around center of the package) is not present don’t continue to next step, stop here and respond with: "Please take a picture of a product sold by NODE COFFEE ROASTERS."

STEP 2 – Identify the following Product Description from Packaging:
1.	Primary coffee origin - Examples: BRAZIL, GUATEMALA, MANDHELING, COSTA RICA
2.	Specific farm/region/processing detail - Examples: 
o	MANDHELING: "PWN G1" (grade designation)
o	COSTA RICA: "Brunca Rivense Yellow Honey"
o	BRAZIL: "CARMO DE MINAS SANTA"
o	GUATEMALA: "Huehuetenango Maya Washed"
3.	Primary coffee origin and Specific farm/region/processing detail in CHINESE - Examples: Chinese versions of lines 1 on packaging
4.	Chinese tasting notes/flavor descriptors (Include English translation for this) - Examples: Flavor characteristics written in Chinese
5.	Origin region and processing method in Chinese (Include English translation for this) - Examples: 亚洲/半水洗, 中美洲/黄蜜处理法, 南美洲/去果皮日晒, 南美洲/水洗
6.	Roast level Profile – Get from previous analysis

STEP 3 - COFFEE PRODUCT ANALYSIS:
Coffee Product Analysis Prompt
You are a knowledgeable coffee expert working at NODE COFFEE SHOP who provides engaging, digestible analysis of your coffee products. When given coffee product information, create a compelling narrative that highlights the most interesting and relevant details for each specific coffee. Write with confidence and expertise about your products. CRITICAL: Never use uncertain language like "likely," "probably," "might refer to," or similar phrases. If you are not confident about a specific detail or term, simply omit it entirely rather than speculating. Only include information you are reasonably confident about (80%+ certainty) to maintain accuracy and authority.
Analysis Structure:
1. About the Origin
•	Focus on what makes THIS specific region unique and noteworthy
•	Highlight 1-2 key geographical or cultural details that matter for this coffee
•	Mention altitude, climate, or soil only if particularly relevant to this origin
•	Keep it conversational and intriguing, not encyclopedic
2. Grade and Sourcing (include only if present)
•	Explain any specific grades, farm names, or quality indicators mentioned
•	Focus on what these details tell us about quality or traceability
•	Skip this section if no specific grading information is provided
3. Processing Method
•	Explain the processing method used and why it matters for THIS coffee
•	Connect the processing to the expected flavor outcomes
•	Be specific about how this method affects the final cup
4. Flavor Profile
•	Interpret the tasting notes in an engaging, accessible way
•	Explain how the flavors work together and what creates the overall experience
•	Make it easy to imagine what drinking this coffee will be like
5. Roast Level
•	Explain the roast level and its key characteristics
•	Focus on how this roast level serves this particular coffee
•	Mention visual and taste impacts concisely
6. Expert Overview
•	Create a concise, compelling sales pitch (2-3 sentences maximum)
•	Highlight key flavors and characteristics that make this coffee irresistible
•	Write as if you're personally recommending this coffee to a customer in the shop
•	Focus on the unique qualities and overall experience this coffee offers
•	Make it enticing and persuasive without being overly promotional
Guidelines:
•	Write in clear, engaging English throughout
•	Be selective - highlight the most compelling aspects for each specific coffee
•	Keep each section concise but informative (2-4 sentences typically)
•	Focus on practical insights that help readers understand what they're buying
•	Correct any geographical errors in source material
•	Adapt the depth of detail to what's most relevant for each coffee
•	Create a compelling narrative, not a technical report
Input Format Expected:
1.	Primary coffee name
2.	Specific farm/region/processing details
3.	Tasting notes/flavor descriptors
4.	Origin region and processing method
5.	Roast level profile
6.	Package weight (if provided)
Your goal is to create an informative yet digestible analysis that makes readers excited about their coffee while understanding its unique characteristics.`;

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showProductView, setShowProductView] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisImages, setAnalysisImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setInput } =
    useChat({
      maxSteps: 10,
      api: `${CONVEX_SITE_URL}/api/chat`,
      onError: (error) => {
        console.error("Chat error:", error);
        if (error.message.includes("429")) {
          setError("Too many requests. Please wait a minute before trying again.");
        } else if (error.message.includes("503")) {
          setError("Service temporarily unavailable. Please try again later.");
        } else {
          setError("An error occurred. Please try again.");
        }
      },
      onFinish: (message) => {
        // Capture the analysis result when the AI responds
        if (message.content && uploadedImages.length > 0) {
          setAnalysisResult(message.content);
          // Convert uploaded files to data URLs for the product view
          const imagePromises = uploadedImages.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          });
          Promise.all(imagePromises).then(setAnalysisImages);
        }
      },
    });

  // Security constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const MAX_FILES = 5; // Maximum number of files
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Enhanced file validation function
  const validateFile = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        resolve(false);
        return;
      }

      // Check MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        console.warn(`File ${file.name} has invalid type: ${file.type}`);
        resolve(false);
        return;
      }

      // Additional check: Read file header to verify it's actually an image
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check for image file signatures (magic numbers)
        const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
        const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
        const isWEBP = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;
        
        if (isJPEG || isPNG || isWEBP) {
          resolve(true);
        } else {
          console.warn(`File ${file.name} failed binary validation - not a real image`);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 12)); // Read first 12 bytes for magic number check
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      ALLOWED_MIME_TYPES.includes(file.type)
    );
    
    // Check file limits
    if (uploadedImages.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`);
      return;
    }
    
    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const isValid = await validateFile(file);
      if (isValid) {
        validFiles.push(file);
      } else {
        alert(`File "${file.name}" was rejected. Please use valid image files under 10MB.`);
      }
    }
    
    if (validFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...validFiles]);
    }
  }, [uploadedImages.length, validateFile]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      ALLOWED_MIME_TYPES.includes(file.type)
    );
    
    // Check file limits
    if (uploadedImages.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`);
      return;
    }
    
    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const isValid = await validateFile(file);
      if (isValid) {
        validFiles.push(file);
      } else {
        alert(`File "${file.name}" was rejected. Please use valid image files under 10MB.`);
      }
    }
    
    if (validFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...validFiles]);
    }
  }, [uploadedImages.length, validateFile]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Helper function to compress images
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && uploadedImages.length === 0) return;

    // Convert File objects to compressed Attachment objects if images are present
    let attachments: Array<{ name: string; contentType: string; url: string }> | undefined;
    const hasImages = uploadedImages.length > 0;
    
    if (hasImages) {
      const imagePromises = uploadedImages.map(async (file) => {
        const compressedUrl = await compressImage(file);
        return {
          name: file.name,
          contentType: 'image/jpeg', // Always JPEG after compression
          url: compressedUrl,
        };
      });
      
      attachments = await Promise.all(imagePromises);
    }

    // Use the engineered prompt if only images were uploaded
    const messageText = !input.trim() && hasImages 
      ? COFFEE_ANALYSIS_PROMPT
      : input;

    // Send the message with attachments
    await append({
      role: 'user',
      content: messageText,
      experimental_attachments: attachments,
    });

    // If images were uploaded (indicating coffee analysis), automatically send follow-up prompt
    if (hasImages && !input.trim()) {
      // Small delay to ensure the first message is processed
      setTimeout(async () => {
        await append({
          role: 'user',
          content: FOLLOW_UP_ANALYSIS_PROMPT,
        });
      }, 100);
    }

    // Clear the form
    setUploadedImages([]);
    setInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [input, uploadedImages, append, setInput, compressImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Coffee Analysis Assistant</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Powered by AI - Ask about your coffee!</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages Area */}
        <div 
          className={cn(
            "flex-1 overflow-y-auto p-6 space-y-4 transition-all duration-200",
            isDragging && "bg-slate-50 dark:bg-slate-800/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag and Drop Overlay */}
          {isDragging && (
            <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-700 text-white px-8 py-4 rounded-xl shadow-lg flex items-center space-x-3">
                <Upload className="w-6 h-6" />
                <span className="text-lg font-medium">Drop your coffee package images here</span>
              </div>
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                NODE Coffee Analysis Assistant
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                Upload a photo of your NODE COFFEE ROASTERS package and I'll provide expert analysis including roast profile, tasting notes, and origin details.
              </p>
              
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 mx-auto max-w-md cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  NODE Coffee package images only • PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message, i) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] px-4 py-3 text-sm shadow-sm",
                  message.role === "user"
                    ? "bg-slate-700 text-white rounded-2xl rounded-br-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-md"
                )}
              >
                {message.parts?.map((part) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="prose prose-sm prose-slate dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 max-w-none"
                        >
                          <Markdown>{part.text}</Markdown>
                        </div>
                      );
                    default:
                      return null;
                  }
                }) || (
                  <div className="prose prose-sm prose-slate dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 max-w-none">
                    <Markdown>{message.content}</Markdown>
                  </div>
                )}
                
                {/* Display uploaded images */}
                {message.experimental_attachments?.filter(attachment => 
                  attachment.contentType?.startsWith('image/')
                ).map((attachment, attachmentIndex) => (
                  <div key={`${message.id}-attachment-${attachmentIndex}`} className="mt-2">
                    <img 
                      src={attachment.url} 
                      alt={attachment.name || `Image ${attachmentIndex + 1}`}
                      className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-600"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <p className="text-xs text-slate-500 mt-1 truncate w-20">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-slate-500 focus:border-slate-500 pr-12"
                value={input}
                placeholder="Ask about NODE Coffee products or upload package images..."
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={() => setShowProductView(true)}
                disabled={!analysisResult || isLoading}
                variant="outline"
                className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20 px-6"
              >
                View
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (!input.trim() && uploadedImages.length === 0)}
                className="bg-slate-700 hover:bg-slate-800 text-white px-6"
              >
                {isLoading ? "Analyzing..." : "Send"}
              </Button>
            </div>
          </form>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Try asking: "What's special about this NODE coffee?" or "How should I brew this blend?"
          </p>
        </div>
      </div>

      {/* Coffee Product View Modal */}
      <CoffeeProductView
        isOpen={showProductView}
        onClose={() => setShowProductView(false)}
        analysis={analysisResult}
        images={analysisImages}
      />
    </div>
  );
} 