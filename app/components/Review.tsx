import { DigiTable, DigiIconCheck, DigiIconExclamationTriangleFilled } from "@digi/arbetsformedlingen-react";
import { StyledLink } from './StyledLink';
import type { FullReview } from '~/data/types';

type Props = {
    review: FullReview;
};

export default function Review({ review }: Props) {
    const styleFromStatus = (status: string | undefined) => {
        switch (status) {
            case 'pass':
                return "bg-[var(--digi--leaf-100)]";
            case 'fail':
                return "bg-[var(--digi--rose-50)]";
            case 'irrelevant':
                return 'bg-[var(--digi--grayscale-200)]';
            default:
                return '';
        }
    };

    return (
        <>
            {review &&
                <DigiTable>
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Krav</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {review?.requirements?.map(req =>
                                <tr key={req.id} className={styleFromStatus(req.check?.status ?? undefined)}>
                                    <td>
                                        <StyledLink to={"/review/" + review.id + "/" + req.id} text={`${req.id}. ${req.topic}`} />
                                    </td>
                                    <td>
                                        {req.check?.status === 'pass' && <span className="flex items-center gap-2"><DigiIconCheck style={{ "--digi--icon--color": "var(--digi--leaf-600)" } as React.CSSProperties} /> Godkänd</span>}
                                        {req.check?.status === 'fail' && <span className="flex items-center gap-2"><span className="block w-[1.5rem]"><DigiIconExclamationTriangleFilled style={{ "--digi--icon--color": "var(--digi--color--text--danger)" } as React.CSSProperties} /></span> Underkänd</span>}
                                        {req.check?.status === 'irrelevant' && <span className="flex items-center gap-2">Ej relevant</span>}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </DigiTable>
            }
        </>
    );
}
