# Organization configurations 
Logos, links and titles that you might want to change depending on the organization. 

## Application title shown in the UI
`"applicationTitle": "Granska tillgänglighet"`

## Logo configuration (JSON format)
Paths are relative to the public directory

```json
"logo": {
    "header": {
        "mobileUrl": "/logoHeaderMobile.svg",
        "desktopUrl": "/logoHeader.svg"
    },
    "footer": {
        "mobileUrl": "/logoFooterMobile.svg",
        "desktopUrl": "/logoFooter.svg"
    }
}'
```
## Regulatory framework to use (either "dos", "lptt" or both "dos, lptt")

`"regulatoryFramework":"dos"`

## Additional requirements specific to your organization (JSON format)

```json
"requirementAdditions": {
    "heading": "",
    "items": [
        {
            "id": "",
            "text": ""
        }
    ]
}
``` 

## Footer links configuration (JSON array format)

```json
"footerLinks": [
        {
            "icon": "email",
            "text": "Mejla vår funktionsbrevlåda",
            "url": "mailto:designsystem@arbetsformedlingen.se"
        },
        {
            "text": "Arbetsförmedlingens designsystem (öppnas i egen flik)",
            "url": "https://designsystem.arbetsformedlingen.se/",
            "external": "true"
        }
 ]
```

## Prefill requirements configuration (JSON array format)
Allows pre-filling certain requirements based on organizational policies

```json
"prefillRequirements": [
    {
        "id": "1",
        "automatic": "false",
        "heading": "Tjänsten använder designsystemet",
        "description": "Har ni utvecklat tjänsten med komponenter, designmönster och designprinciper från designsystemet så godkänns flera krav.",
        "activateText": "Är tjänsten utvecklad med Arbetsförmedlingens designsystem?",
        "prefillRequirements": [
            {
            "ids": ["sela", "sekn", "seli", "seta", "roko", "plet"],
            "status": "PASS",
            "comment": "Kravet har förifyllts som godkänt eftersom tjänsten, enligt tidigare ifyllda uppgifter, använder designsystemets komponenter och riktlinjer."
            }
        ]
    }, 
]
```
