import { NavigationVerticalMenuVariation } from "@digi/arbetsformedlingen";
import { DigiNavigationVerticalMenu, DigiNavigationVerticalMenuItem } from "@digi/arbetsformedlingen-react";
import type { Category } from "~/data/types";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

type Props = {
    reviewId: string;
    categories: Category[];
    selectedCategory: string;
    selectedRequirement: string;
    hideIrrelevant: boolean;
};
export default function CategoryNav({ reviewId, categories, selectedCategory, selectedRequirement, hideIrrelevant }: Props) {
    const navigate = useNavigate();
    const onSelectCategory = (category: string) => {
        const firstInCategory = categories.find(cat => cat.category === category);
        if (firstInCategory) {
            const firstRequirement = firstInCategory.requirements.filter(req => {
                if (hideIrrelevant && req.check?.status === 'irrelevant') return false;
                return true;
            })[0];
            if (firstRequirement) {
                navigate(`/review/${reviewId}/${firstRequirement.id}`);
            }
        }
    };
    const getShortStatus = (status: string) => {
        switch (status) {
            case 'pass':
                return '✅';
            case 'fail':
                return '❌';
            case 'irrelevant':
                return '🚫';
            default:
                return '';
        }
    };
    const getCategoryStatus = (category: string) => {
        const requirements = categories.find(cat => cat.category === category)?.requirements;
        if (!requirements) return '';
        const checked = requirements.filter(req => req.check?.status === 'pass' || req.check?.status === 'fail').length;
        const total = requirements.filter(req => hideIrrelevant ? req.check?.status !== "irrelevant" : true).length;
        return `(${checked}/${total})`;
    };

    const filteredCategories = useMemo(() => {
        return categories.map(category => ({
            ...category,
            requirements: category.requirements.filter(req =>
                !(hideIrrelevant && req.check?.status === 'irrelevant')
            ),
        })).filter(category => category.requirements.length > 0);
    }, [categories, hideIrrelevant]);

    return (
        <DigiNavigationVerticalMenu
            afVariation={NavigationVerticalMenuVariation.PRIMARY}
        >
            <ul>
                {filteredCategories.map(category => (
                    <li key={category.category}>
                        <DigiNavigationVerticalMenuItem
                            afText={`${category.category} ${getCategoryStatus(category.category)}`}
                            afActiveSubnav={selectedCategory === category.category}
                            onClick={() => onSelectCategory(category.category)}
                            afActive={selectedCategory === category.category}
                        />
                        <ul>
                            {category.requirements.map(req => (
                                <li key={req.id}>
                                    <DigiNavigationVerticalMenuItem
                                        afText={`${selectedRequirement == req.id ? '➡ ' : ''}${req.topic ?? ""} ${getShortStatus(req.check?.status ?? "")}`}
                                        onClick={() => navigate(`/review/${reviewId}/${req.id}`)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </DigiNavigationVerticalMenu>
    );
}