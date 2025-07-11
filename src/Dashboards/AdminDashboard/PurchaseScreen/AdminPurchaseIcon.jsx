
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


import { useNavigate } from 'react-router-dom';

const AdminPurchaseIcon = () => {
    const [selectedFeatures, setSelectedFeatures] = useState([
        "Manager Dashboard",
    ]);

    const navigate = useNavigate();

    // Previouslty purchased features get form ls
    useEffect(() => {
        const storedFeatures = localStorage.getItem("purchasedFeatures");
        if (storedFeatures) {
            try {
                const parsedFeatures = JSON.parse(storedFeatures);
                setSelectedFeatures(parsedFeatures);
            } catch (error) {
                console.error("Error parsing stored features:", error);
                setSelectedFeatures(["Manager Dashboard"]);
            }
        }
    }, []);

    const side_bar = [
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

    const handleSelectFeature = (name) => {
        setSelectedFeatures((prevFeatures) => {
            const newFeatures = prevFeatures.includes(name)
                ? prevFeatures.filter((feature) => feature !== name)
                : [...prevFeatures, name];

            // Update localStorage immediately when selection changes
            localStorage.setItem("purchasedFeatures", JSON.stringify(newFeatures));
            return newFeatures;
        });
    };

    const handlePurchaseFeature = (featureName) => {
        console.log(`Purchasing feature: ${featureName}`);
        setSelectedFeatures((prevFeatures) => {
            const newFeatures = prevFeatures.includes(featureName)
                ? prevFeatures
                : [...prevFeatures, featureName];

            // Update localStorage
            localStorage.setItem("purchasedFeatures", JSON.stringify(newFeatures));
            return newFeatures;
        });
    };

    const handleUnpurchaseFeature = (featureName) => {
        console.log(`Unpurchasing feature: ${featureName}`);
        setSelectedFeatures((prevFeatures) => {
            const newFeatures = prevFeatures.filter((feature) => feature !== featureName);

            // Update localStorage
            localStorage.setItem("purchasedFeatures", JSON.stringify(newFeatures));
            return newFeatures;
        });
    };

    const goPurchaseStore = () => {
      navigate("/admin");
    }

    const handlePurchaseAll = () => {
        localStorage.setItem("purchasedFeatures", JSON.stringify(selectedFeatures));
        console.log("Purchasing all selected features:", selectedFeatures);
        goPurchaseStore();
    };
    const isFeatureSelected = (featureName) => {
        return selectedFeatures.includes(featureName);
    };

    return (
        <div className="container mx-auto min-h-screen flex justify-center items-center flex-col py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Feature Store</h1>
                <p className="text-gray-600">Select and purchase the features you need</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center mb-8">
                {side_bar.map((item) => (
                    <div key={item.name} className="relative">
                        {/* SELECTION */}
                        {isFeatureSelected(item.name) && (
                            <div className="absolute -top-2 -right-2 z-10 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                <Check size={16} />
                            </div>
                        )}
                        {/* FEATURES */}
                        <div
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 w-40 h-40 flex flex-col justify-between items-center ${isFeatureSelected(item.name)
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
                                {isFeatureSelected(item.name) ? (
                                    <button
                                        className="bg-red-500 text-white px-4 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnpurchaseFeature(item.name);
                                        }}
                                    >
                                        Unpurchase
                                    </button>
                                ) : (
                                    <button
                                        className="bg-blue-500 text-white px-4 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePurchaseFeature(item.name);
                                        }}
                                    >
                                        Purchase
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* PURCHASE BUTTON */}
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