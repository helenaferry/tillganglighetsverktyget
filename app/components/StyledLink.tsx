import React from "react";
import { useNavigate } from "react-router";
import { DigiLink, DigiLinkButton } from '@digi/arbetsformedlingen-react';
import { type DigiLinkButtonCustomEvent, type DigiLinkCustomEvent } from "@digi/arbetsformedlingen";

type Props = {
    to: string;
    text: string;
    isButton?: boolean;
};

export function StyledLink({ to, text, isButton, ...props }: Props) {
    const navigate = useNavigate();

    const handleLinkClick = (e: DigiLinkCustomEvent<MouseEvent>) => {
        e.preventDefault();
        navigate(to);
    };

    const handleButtonClick = (event: DigiLinkButtonCustomEvent<MouseEvent>) => {
        event.preventDefault();
        navigate(to);
    };

    return (
        <>
            {isButton ? (
                <DigiLinkButton
                    {...props}
                    onAfOnClick={handleButtonClick}
                >{text}</DigiLinkButton>
            ) : (
                <DigiLink
                    {...props}
                    afHref={to}
                    onAfOnClick={handleLinkClick}
                >{text}</DigiLink>
            )}
        </>
    );
}
