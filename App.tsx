import React, { useState, useCallback, useRef } from 'react';
import type { ImageState } from './types';
import { editImageWithPrompt } from './services/geminiService';

const Spinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20 rounded-xl">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ImagePlaceholder: React.FC<{ onImageSelect: (file: File) => void }> = ({ onImageSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-gray-800 transition-all duration-300"
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            aria-label="Image upload area"
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
            <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-gray-400 text-center">Drag & drop your photo here</p>
            <p className="text-gray-500 text-sm">or click to select a file</p>
        </div>
    );
};

interface TimeEra {
  id: string;
  name: string;
  prompt: string;
}

const eras: TimeEra[] = [
    {
      id: 'ancient_rome',
      name: 'Ancient Rome',
      prompt: `You are an image processing model performing a precision-based task. Your instructions are a technical specification. Deviating from these rules is a critical failure.

**TASK:** Edit the user-provided image. Do not create a new image from scratch.

**CRITICAL FAILURE CONDITION:** The task is a critical failure if you add people, remove people, or alter the faces/identities of the people in the original image. If the number of people in the output image is different from the input image, the task has failed. If the faces are not recognizable as the original people, the task has failed.

**TECHNICAL SPECIFICATION:**
1.  **IDENTIFY SUBJECTS:** Identify every person in the input image. These are the "subjects."
2.  **PRESERVE SUBJECTS (RULE #1 - NON-NEGOTIABLE):**
    *   You MUST preserve the exact faces, body shapes, and poses of all subjects.
    *   The total number of subjects in the output MUST be identical to the input.
    *   The identities of the subjects MUST be perfectly recognizable.
3.  **MODIFY CLOTHING (RULE #2 - NON-NEGOTIABLE):**
    *   You MUST change the clothing of **ALL** subjects to period-appropriate togas and Roman attire.
    *   **FAILURE CHECK:** Verify that no subject remains in their original clothes.
4.  **MODIFY BACKGROUND (RULE #3 - NON-NEGOTIABLE):**
    *   You MUST replace the original background with a scene from Ancient Rome (e.g., the Colosseum, a Roman villa).`
    },
    {
      id: 'roaring_20s',
      name: "Roaring '20s",
      prompt: `You are an image processing model performing a precision-based task. Your instructions are a technical specification. Deviating from these rules is a critical failure.

**TASK:** Edit the user-provided image. Do not create a new image from scratch.

**CRITICAL FAILURE CONDITION:** The task is a critical failure if you add people, remove people, or alter the faces/identities of the people in the original image. If the number of people in the output image is different from the input image, the task has failed. If the faces are not recognizable as the original people, the task has failed.

**TECHNICAL SPECIFICATION:**
1.  **IDENTIFY SUBJECTS:** Identify every person in the input image. These are the "subjects."
2.  **PRESERVE SUBJECTS (RULE #1 - NON-NEGOTIABLE):**
    *   You MUST preserve the exact faces, body shapes, and poses of all subjects.
    *   The total number of subjects in the output MUST be identical to the input.
    *   The identities of the subjects MUST be perfectly recognizable.
3.  **MODIFY CLOTHING (RULE #2 - NON-NEGOTIABLE):**
    *   You MUST change the clothing of **ALL** subjects to 1920s flapper dresses and dapper suits.
    *   **FAILURE CHECK:** Verify that no subject remains in their original clothes.
4.  **MODIFY BACKGROUND (RULE #3 - NON-NEGOTIABLE):**
    *   You MUST replace the original background with a 1920s jazz club or speakeasy.
5.  **APPLY FILTER (RULE #4 - NON-NEGOTIABLE):**
    *   You MUST apply a sepia filter over the entire final image.`
    },
    {
      id: 'wild_west',
      name: 'Wild West',
      prompt: `You are an image processing model performing a precision-based task. Your instructions are a technical specification. Deviating from these rules is a critical failure.

**TASK:** Edit the user-provided image. Do not create a new image from scratch.

**CRITICAL FAILURE CONDITION:** The task is a critical failure if you add people, remove people, or alter the faces/identities of the people in the original image. If the number of people in the output image is different from the input image, the task has failed. If the faces are not recognizable as the original people, the task has failed.

**TECHNICAL SPECIFICATION:**
1.  **IDENTIFY SUBJECTS:** Identify every person in the input image. These are the "subjects."
2.  **PRESERVE SUBJECTS (RULE #1 - NON-NEGOTIABLE):**
    *   You MUST preserve the exact faces, body shapes, and poses of all subjects.
    *   The total number of subjects in the output MUST be identical to the input.
    *   The identities of the subjects MUST be perfectly recognizable.
3.  **MODIFY CLOTHING (RULE #2 - NON-NEGOTIABLE):**
    *   You MUST change the clothing of **ALL** subjects to cowboy/cowgirl outfits with hats and boots.
    *   **FAILURE CHECK:** Verify that no subject remains in their original clothes.
4.  **MODIFY BACKGROUND (RULE #3 - NON-NEGOTIABLE):**
    *   You MUST replace the original background with a dusty main street of a Wild West town.`
    },
    {
      id: 'victorian_era',
      name: 'Victorian Era',
      prompt: `You are an image processing model performing a precision-based task. Your instructions are a technical specification. Deviating from these rules is a critical failure.

**TASK:** Edit the user-provided image. Do not create a new image from scratch.

**CRITICAL FAILURE CONDITION:** The task is a critical failure if you add people, remove people, or alter the faces/identities of the people in the original image. If the number of people in the output image is different from the input image, the task has failed. If the faces are not recognizable as the original people, the task has failed.

**TECHNICAL SPECIFICATION:**
1.  **IDENTIFY SUBJECTS:** Identify every person in the input image. These are the "subjects."
2.  **PRESERVE SUBJECTS (RULE #1 - NON-NEGOTIABLE):**
    *   You MUST preserve the exact faces, body shapes, and poses of all subjects.
    *   The total number of subjects in the output MUST be identical to the input.
    *   The identities of the subjects MUST be perfectly recognizable.
3.  **MODIFY CLOTHING (RULE #2 - NON-NEGOTIABLE):**
    *   You MUST change the clothing of **ALL** subjects to elegant Victorian attire (e.g., gowns, top hats, suits).
    *   **FAILURE CHECK:** Verify that no subject remains in their original clothes.
4.  **MODIFY BACKGROUND (RULE #3 - NON-NEGOTIABLE):**
    *   You MUST replace the original background with a Victorian portrait studio or an opulent parlor.
5.  **APPLY EFFECT (RULE #4 - NON-NEGOTIABLE):**
    *   You MUST apply an aged photo effect over the entire final image.`
    },
    {
      id: '80s_neon',
      name: "'80s Neon",
      prompt: `You are an image processing model performing a precision-based task. Your instructions are a technical specification. Deviating from these rules is a critical failure.

**TASK:** Edit the user-provided image. Do not create a new image from scratch.

**CRITICAL FAILURE CONDITION:** The task is a critical failure if you add people, remove people, or alter the faces/identities of the people in the original image. If the number of people in the output image is different from the input image, the task has failed. If the faces are not recognizable as the original people, the task has failed.

**TECHNICAL SPECIFICATION:**
1.  **IDENTIFY SUBJECTS:** Identify every person in the input image. These are the "subjects."
2.  **PRESERVE SUBJECTS (RULE #1 - NON-NEGOTIABLE):**
    *   You MUST preserve the exact faces, body shapes, and poses of all subjects.
    *   The total number of subjects in the output MUST be identical to the input.
    *   The identities of the subjects MUST be perfectly recognizable.
3.  **MODIFY CLOTHING & HAIR (RULE #2 - NON-NEGOTIABLE):**
    *   You MUST change the clothing of **ALL** subjects to neon-colored 80s outfits. You MUST also change the hairstyle of **ALL** subjects to be 80s-themed.
    *   **FAILURE CHECK:** Verify that no subject remains in their original clothes or hairstyle.
4.  **MODIFY BACKGROUND (RULE #3 - NON-NEGOTIABLE):**
    *   You MUST replace the original background with a retro 80s arcade filled with neon lights.`
    },
    {
      id: 'future_cyberpunk',
      name: 'Future Cyberpunk',
      prompt: `You are an image processing model performing a precision-based task. Your instructions are a technical specification. Deviating from these rules is a critical failure.

**TASK:** Edit the user-provided image. Do not create a new image from scratch.

**CRITICAL FAILURE CONDITION:** The task is a critical failure if you add people, remove people, or alter the faces/identities of the people in the original image. If the number of people in the output image is different from the input image, the task has failed. If the faces are not recognizable as the original people, the task has failed.

**TECHNICAL SPECIFICATION:**
1.  **IDENTIFY SUBJECTS:** Identify every person in the input image. These are the "subjects."
2.  **PRESERVE SUBJECTS (RULE #1 - NON-NEGOTIABLE):**
    *   You MUST preserve the exact faces, body shapes, and poses of all subjects.
    *   The total number of subjects in the output MUST be identical to the input.
    *   The identities of the subjects MUST be perfectly recognizable.
3.  **MODIFY CLOTHING (RULE #2 - NON-NEGOTIABLE):**
    *   You MUST change the clothing of **ALL** subjects to be futuristic and cyberpunk-themed.
    *   **FAILURE CHECK:** Verify that no subject remains in their original clothes.
4.  **MODIFY BACKGROUND (RULE #3 - NON-NEGOTIABLE):**
    *   You MUST replace the original background with a neon-lit, high-tech cyberpunk cityscape at night.`
    },
];


export default function App() {
  const [originalImage, setOriginalImage] = useState<ImageState | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const promptSectionRef = useRef<HTMLElement>(null);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPEG, WEBP).');
        return;
    }
    setError(null);
    setGeneratedImage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setOriginalImage({
        base64: base64String,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }, []);
  
  const clearImage = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) {
        setError('Please describe your desired time-travel scene.');
        return;
    }
    
    if (!originalImage) {
        setError('Please upload a photo first.');
        return;
    }

    setError(null);
    setGeneratedImage(null);
    setIsLoading(true);

    try {
      const resultBase64 = await editImageWithPrompt(originalImage, prompt);
      setGeneratedImage(resultBase64);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = `time-travel-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTryAnother = () => {
    setGeneratedImage(null);
    setError(null);
    promptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Time-Travel Photo Booth
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Upload your portrait, describe a scene, and see yourself in another time!
        </p>
      </header>
      
      <main className="flex-grow flex flex-col items-center w-full gap-8 lg:gap-12">
        {/* Section 1: Upload */}
        <section className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 text-center">1. Upload Your Photo</h2>
            <div className="w-full bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
                <p><strong className="font-bold">Pro Tip:</strong> This is cutting-edge AI! It works like magic but can get confused by group photos. For the most reliable results, start with photos of 1-3 people.</p>
            </div>
            <div className="w-full aspect-square bg-gray-800/50 rounded-xl shadow-lg relative">
                {originalImage ? (
                    <>
                        <img 
                            src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} 
                            alt="Original" 
                            className="w-full h-full object-contain rounded-xl"
                        />
                         <button onClick={clearImage} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 text-sm transition-transform duration-200 hover:scale-110 z-10" aria-label="Remove image">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <ImagePlaceholder onImageSelect={handleImageUpload} />
                )}
            </div>
        </section>

        {/* Section 2: Describe and Generate */}
        <section ref={promptSectionRef} className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 text-center">2. Describe Your Destination</h2>
            <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg">
                <label htmlFor="prompt-input" className="sr-only">
                    Describe Your Destination
                </label>
                 <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`For best results, use a technical specification. E.g.,

TASK: Edit the image.
CRITICAL FAILURE CONDITION: Do not add, remove, or change the people.
SPECIFICATION:
1. PRESERVE SUBJECTS: Keep the original people.
2. MODIFY CLOTHING: Change ALL outfits to astronaut suits.
3. MODIFY BACKGROUND: Place them on the moon's surface.`}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                    rows={6}
                    aria-label="Time-travel scene description"
                />
                <div className="mt-3">
                    <p className="text-sm text-gray-400 text-center mb-2">Or get inspired by an era:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {eras.map((era) => (
                            <button
                                key={era.id}
                                onClick={() => setPrompt(era.prompt)}
                                className="p-2 text-center font-semibold rounded-lg transition-all duration-200 text-xs bg-gray-700 hover:bg-purple-600 hover:text-white"
                                title={era.prompt}
                            >
                                {era.name}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !originalImage || !prompt.trim()}
                    className="mt-4 w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                    {isLoading ? 'Traveling Through Time...' : '⏳ Time Travel!'}
                </button>
            </div>
            {error && (
                <div className="mt-4 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
        </section>

        {/* Section 3: Result */}
        <section className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 text-center">3. View Your Time-Travel Result</h2>
            <div className="w-full aspect-square bg-gray-800/50 rounded-xl shadow-lg relative">
                {isLoading && <Spinner />}
                {generatedImage ? (
                    <img 
                        src={`data:image/png;base64,${generatedImage}`} 
                        alt="Generated time-travel photo" 
                        className="w-full h-full object-contain rounded-xl"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Your journey through time awaits
                    </div>
                )}
            </div>
             {generatedImage && !isLoading && (
                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        onClick={handleTryAnother}
                        className="font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white focus:ring-purple-400"
                    >
                        Edit Prompt & Regenerate
                    </button>
                    <button
                        onClick={handleDownload}
                        className="font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-400"
                    >
                        Download Photo
                    </button>
                    <button
                        onClick={clearImage}
                        className="font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400"
                    >
                        Start Over with New Photo
                    </button>
                </div>
            )}
        </section>
      </main>

      <footer className="text-center text-gray-500 text-sm mt-12 pb-4">
        <p>Crafted with Gemini AI</p>
      </footer>
    </div>
  );
}
