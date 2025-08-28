import React from "react";
import { useNavigate } from "react-router";
import { DigiLink } from '@digi/arbetsformedlingen-react';
import { type DigiLinkCustomEvent } from "@digi/arbetsformedlingen";

type Props = React.ComponentProps<typeof DigiLink> & {
    to: string;
    text: string;
};

export function StyledLink({ to, text, ...props }: Props) {
    const navigate = useNavigate();

    const handleClick = (e: DigiLinkCustomEvent<MouseEvent>) => {
        e.preventDefault();
        navigate(to);
    };

    return (
        <DigiLink
            {...props}
            afHref={to}
            onAfOnClick={handleClick}
        >{text}</DigiLink>
    );
}
