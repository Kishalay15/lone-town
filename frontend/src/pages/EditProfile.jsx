import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function EditProfile() {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const [form, setForm] = useState({
        name: storedUser.name,
        email: storedUser.email,
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updatedForm = { ...prev, [name]: value };

            if (name === "password" || name === "confirmPassword") {
                setPasswordsMatch(
                    updatedForm.password === updatedForm.confirmPassword
                );
            }

            return updatedForm;
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword } = form;

        if (password.trim()) {
            if (password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }
            if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
        }

        const payload = { name, email };
        if (password.trim()) payload.password = password;

        try {
            const { data } = await axios.put(`/users/${storedUser._id}`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success("Profile updated successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md"
            >
                <h2 className="text-xl font-bold text-purple-700 mb-4">Edit Profile</h2>

                <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full mb-3 px-4 py-2 border rounded-lg"
                    required
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full mb-3 px-4 py-2 border rounded-lg"
                    required
                />

                <div className="relative mb-3">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password (min 6 chars)"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="relative mb-3">
                    <input
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>

                </div>
                {form.password.trim() && !passwordsMatch && (
                    <p className="text-sm text-red-500 mb-3">Passwords do not match.</p>
                )}


                <button
                    type="submit"
                    disabled={
                        form.password.trim() && (!passwordsMatch || form.password.length < 6)
                    }
                    className={`w-full py-2 rounded-lg text-white ${form.password.trim() && (!passwordsMatch || form.password.length < 6)
                        ? "bg-purple-300 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                        }`}
                >
                    Save Changes
                </button>


                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full mt-2 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}
