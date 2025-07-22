
import { useState, useEffect } from "react";
import {
    File,
    HelpingHand,
    MessageCircle,
    Package,
    Users,
    Users2,
    Check
} from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const baseApi = process.env.VITE_BASE_API;

const AdminPurchaseIcon = () => {
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [purchasedFeatures, setPurchasedFeatures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(JSON.parse(sessionStorage.getItem("userdata")));
    const navigate = useNavigate();

    // Update userInfo when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setUserInfo(JSON.parse(sessionStorage.getItem("userdata")));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Fetch purchased features when userInfo.user_id changes
    useEffect(() => {
        const fetchFeatures = async () => {
            setIsLoading(true);
            setPurchasedFeatures([]); // Reset to avoid stale data
            setSelectedFeatures([]); // Reset to avoid stale selections
            try {
                if (userInfo?.user_id) {
                    const response = await axios.get(`${baseApi}/api/admin/${userInfo.user_id}/features/`);
                    setPurchasedFeatures(response.data.features || []);
                }
            } catch (error) {
                console.error("Error fetching features:", error);
                setPurchasedFeatures([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeatures();
    }, [userInfo?.user_id]);

    const side_bar = [
        {
            link: "/admin/user",
            name: "User Dashboard",
            icon: <Users size={20} />,
        },
        {
            link: "/admin/manager",
            name: "Manager Dashboard",
            icon: <Users size={20} />,
        },
        {
            link: "/admin/hr-management",
            name: "HR-Management",
            icon: <Users size={20} />,
        },
        {
            link: "/admin/employee",
            name: "Employment Management",
            icon: <Users size={20} />,
        },
        {
            link: "/admin/supervisor",
            name: "Supervisor Management",
            icon: <Users size={20} />,
        },
        {
            link: "helpdesk",
            name: "Help Desk",
            icon: <HelpingHand size={20} />,
        },
        {
            link: "/admin/projectManagement",
            name: "Project Management",
            icon: <File size={20} />,
        },
        {
            link: "/admin/kpi-employee",
            name: "KPI Employee",
            icon: <Users2 size={20} />,
        },
        {
            link: "/admin/training-programs",
            name: "Training & Development",
            icon: <Users2 size={20} />,
        },
        {
            link: "/admin/kpi-manager",
            name: "KPI Manager",
            icon: <Users2 size={20} />,
        },
        {
            link: "/admin/feedback",
            name: "FeedBack",
            icon: <MessageCircle size={20} />,
        },
        {
            link: "/admin/other",
            name: "Others",
            icon: <Users size={20} />,
        },
        {
            link: "inventory",
            name: "Inventory",
            icon: <Package size={20} />,
        },
        {
            link: "account-management",
            name: "Account Management",
            icon: <Users size={20} />,
        },
    ];

    const handlePurchaseFeature = (featureName) => {
        console.log(`Selecting feature: ${featureName}`);
        setSelectedFeatures((prevFeatures) => {
            if (prevFeatures.includes(featureName)) {
                return prevFeatures; // Feature already selected, no change
            }
            return [...prevFeatures, featureName];
        });
    };

    const handleUnpurchaseFeature = (featureName) => {
        console.log(`Deselecting feature: ${featureName}`);
        setSelectedFeatures((prevFeatures) => {
            return prevFeatures.filter((feature) => feature !== featureName);
        });
    };

    const handlePurchaseAll = async () => {
        try {
            await axios.patch(`${baseApi}/api/admin/${userInfo?.user_id}/features/update/`, { features: [...purchasedFeatures, ...selectedFeatures] });
            console.log("Purchasing all selected features:", selectedFeatures);
            navigate("/admin");
        } catch (error) {
            console.error("Error purchasing features:", error);
        }
    };

    const isFeaturePurchased = (featureName) => {
        return purchasedFeatures.includes(featureName);
    };

    const isFeatureSelected = (featureName) => {
        return selectedFeatures.includes(featureName);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto min-h-screen flex justify-center items-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-screen flex justify-center items-center flex-col py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Feature Store</h1>
                <p className="text-gray-600">Select and purchase the features you need</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center mb-8">
                {side_bar.map((item) => (
                    <div key={item.name} className="relative">
                        {isFeaturePurchased(item.name) && (
                            <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                <Check size={12} />
                            </div>
                        )}
                        {isFeatureSelected(item.name) && !isFeaturePurchased(item.name) && (
                            <div className="absolute -top-1 -right-1 z-10 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                <Check size={12} />
                            </div>
                        )}
                        <div
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 w-40 h-40 flex flex-col justify-between items-center ${
                                isFeatureSelected(item.name) && !isFeaturePurchased(item.name)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-2">
                                    {item.icon}
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 text-center leading-tight">
                                {item.name}
                            </h3>
                            <div>
                                {isFeaturePurchased(item.name) ? (
                                    <button
                                        className="bg-green-500 text-white px-4 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                                        disabled
                                    >
                                        Purchased
                                    </button>
                                ) : (
                                    <button
                                        className={`${
                                            isFeatureSelected(item.name)
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white px-4 py-1 rounded text-xs font-medium transition-colors`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isFeatureSelected(item.name)) {
                                                handleUnpurchaseFeature(item.name);
                                            } else {
                                                handlePurchaseFeature(item.name);
                                            }
                                        }}
                                    >
                                        {isFeatureSelected(item.name) ? 'Unpurchase' : 'Purchase'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center">
                <button
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
                    onClick={handlePurchaseAll}
                >
                    Purchase Selected Features ({selectedFeatures.length})
                </button>
            </div>
        </div>
    );
};

export default AdminPurchaseIcon;
