"use client";

import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Star, ThumbsUp, ThumbsDown, Send, Heart, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    // Form state
    const [rating, setRating] = useState<number>(0);
    const [likedEvent, setLikedEvent] = useState<boolean | null>(null);
    const [wantMore, setWantMore] = useState<boolean | null>(null);
    const [comments, setComments] = useState("");

    useEffect(() => {
        if (isOpen) {
            checkExistingFeedback();
        }
    }, [isOpen]);

    async function checkExistingFeedback() {
        try {
            const res = await fetch("/api/feedback/check");
            if (res.ok) {
                const data = await res.json();
                if (data.exists) {
                    setAlreadySubmitted(true);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSubmit() {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    likedEvent,
                    wantMore,
                    comments
                }),
            });

            if (res.ok) {
                toast.success("Thank you for your feedback!");
                setStep(3); // Success step
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                toast.error("Failed to submit feedback");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    if (alreadySubmitted) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white overflow-hidden">
                <DialogHeader>
                    <div className="mx-auto bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Heart className="text-primary h-6 w-6 fill-current" />
                    </div>
                    <DialogTitle className="text-center text-xl font-black uppercase tracking-tight">
                        {step === 1 ? "How was the event?" : step === 2 ? "Final thoughts" : "Thank you!"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-400">
                        {step === 1 
                            ? "We'd love to hear your thoughts on this Speed Dating!" 
                            : step === 2 
                            ? "Help us make ESN events even better."
                            : "Your feedback was recorded successfully."}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="py-6 space-y-8">
                        {/* Rating Scale */}
                        <div className="space-y-4 text-center">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                How do you feel about the connection you made?
                            </Label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-all p-2 rounded-xl ${
                                            rating >= star ? "text-primary scale-110" : "text-zinc-700 hover:text-zinc-500"
                                        }`}
                                    >
                                        <Star className={`h-8 w-8 ${rating >= star ? "fill-current" : ""}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Liked Event */}
                        <div className="space-y-4 text-center">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                Did you like the overall experience?
                            </Label>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className={`rounded-2xl border-2 flex-1 gap-2 ${likedEvent === true ? "bg-primary border-primary text-black" : "bg-transparent border-zinc-800 text-white"}`}
                                    onClick={() => setLikedEvent(true)}
                                >
                                    <ThumbsUp className="h-4 w-4" /> Yes
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className={`rounded-2xl border-2 flex-1 gap-2 ${likedEvent === false ? "bg-red-500 border-red-500 text-black" : "bg-transparent border-zinc-800 text-white"}`}
                                    onClick={() => setLikedEvent(false)}
                                >
                                    <ThumbsDown className="h-4 w-4" /> No
                                </Button>
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:bg-zinc-200 transition-all"
                            onClick={() => rating > 0 && setStep(2)}
                            disabled={rating === 0}
                        >
                            Next Step
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="py-6 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                Should we keep Speed Dating in this semester?
                            </Label>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className={`rounded-2xl border-2 flex-1 ${wantMore === true ? "bg-primary border-primary text-black" : "bg-transparent border-zinc-800 text-white"}`}
                                    onClick={() => setWantMore(true)}
                                >
                                    Definitely!
                                </Button>
                                <Button
                                    variant="outline"
                                    className={`rounded-2xl border-2 flex-1 ${wantMore === false ? "bg-zinc-800 border-zinc-700 text-white" : "bg-transparent border-zinc-800 text-white"}`}
                                    onClick={() => setWantMore(false)}
                                >
                                    Maybe not
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Anything to add?</Label>
                            <Textarea 
                                placeholder="Tell us more about your experience..."
                                className="bg-zinc-900 border-zinc-800 rounded-2xl min-h-[100px] text-white focus:border-primary transition-all"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                             <Button 
                                variant="ghost"
                                className="font-bold text-zinc-400"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button 
                                className="flex-1 bg-primary text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,191,0,0.3)]"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Feedback"} <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                        <div className="bg-green-500/20 p-4 rounded-full mb-6">
                            <PartyPopper className="h-12 w-12 text-green-500" />
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white mb-2">You're Awesome!</h4>
                        <p className="text-zinc-400 max-w-[250px]">Your feedback is helping us build the best International Community in Porto.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
