import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        emotionalIntelligence: 5,
        psychologicalTraits: { openness: 5, neuroticism: 5 },
        behavioralPatterns: { introversion: 5 },
        relationshipValues: { honesty: 5 },
    });

    const navigate = useNavigate();

    const handleSliderChange = (section, key, value) => {
        if (section === "emotionalIntelligence") {
            setAnswers((prev) => ({ ...prev, emotionalIntelligence: value }));
        } else {
            setAnswers((prev) => ({
                ...prev,
                [section]: { ...prev[section], [key]: value },
            }));
        }
    };

    const handleSubmit = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            await axios.put(`/users/${user._id}`, answers, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            navigate("/dashboard");
        } catch (err) {
            alert("Failed to save onboarding data.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
            <div className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-xl text-center">
                <h2 className="text-xl font-semibold text-purple-700 mb-6">
                    Onboarding - Step {step + 1} of 4
                </h2>

                {step === 0 && (
                    <>
                        <p className="mb-4">Emotional Intelligence (1–10)</p>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={answers.emotionalIntelligence}
                            onChange={(e) =>
                                handleSliderChange("emotionalIntelligence", null, Number(e.target.value))
                            }
                            className="w-full"
                        />
                        <p className="mt-2">{answers.emotionalIntelligence}</p>
                    </>
                )}

                {step === 1 && (
                    <>
                        <p className="mb-4">Psychological Traits</p>
                        <label className="block mb-3">Openness: {answers.psychologicalTraits.openness}</label>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={answers.psychologicalTraits.openness}
                            onChange={(e) =>
                                handleSliderChange("psychologicalTraits", "openness", Number(e.target.value))
                            }
                            className="w-full"
                        />
                        <label className="block mt-4 mb-3">
                            Neuroticism: {answers.psychologicalTraits.neuroticism}
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={answers.psychologicalTraits.neuroticism}
                            onChange={(e) =>
                                handleSliderChange("psychologicalTraits", "neuroticism", Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="mb-4">Behavioral Patterns</p>
                        <label className="block mb-3">Introversion: {answers.behavioralPatterns.introversion}</label>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={answers.behavioralPatterns.introversion}
                            onChange={(e) =>
                                handleSliderChange("behavioralPatterns", "introversion", Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </>
                )}

                {step === 3 && (
                    <>
                        <p className="mb-4">Relationship Values</p>
                        <label className="block mb-3">Honesty: {answers.relationshipValues.honesty}</label>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={answers.relationshipValues.honesty}
                            onChange={(e) =>
                                handleSliderChange("relationshipValues", "honesty", Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </>
                )}

                <div className="flex justify-between mt-6">
                    {step > 0 && (
                        <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setStep((s) => s - 1)}>
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                            onClick={() => setStep((s) => s + 1)}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                            onClick={handleSubmit}
                        >
                            Finish Onboarding
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
