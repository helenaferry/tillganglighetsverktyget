import {
  LayoutBlockVariation,
  LayoutContainerVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiTypographyHeadingJumbo,
  DigiTypographyPreamble,
} from '@designsystem-se/af-react';

import Breadcrumbs from './Breadcrumbs';

type Props = {
  h1Text: string;
  preamble?: string;
  breadcrumbsCurrentPage?: string;
  breadcrumbsPages?: { title: string; href: string }[];
  children?: React.ReactNode;
};
const PageTitle = ({
  h1Text,
  preamble,
  breadcrumbsCurrentPage,
  breadcrumbsPages,
  children,
}: Props) => {
  return (
    <DigiLayoutContainer afVariation={LayoutContainerVariation.FLUID} afNoGutter={true}>
      <DigiLayoutBlock
        afVariation={LayoutBlockVariation.PRIMARY}
        afMarginTop={true}
        afVerticalPadding={true}
      >
        {breadcrumbsCurrentPage && breadcrumbsPages && (
          <Breadcrumbs currentPage={breadcrumbsCurrentPage} pages={breadcrumbsPages} />
        )}
        <DigiTypographyHeadingJumbo
          id="h1"
          afText={h1Text}
          afLevel={TypographyHeadingJumboLevel.H1}
          afVariation={TypographyHeadingJumboVariation.PRIMARY}
        ></DigiTypographyHeadingJumbo>
        {preamble && (
          <div className="mt-5">
            <DigiTypographyPreamble>{preamble}</DigiTypographyPreamble>
          </div>
        )}
        {children}
      </DigiLayoutBlock>
    </DigiLayoutContainer>
  );
};
export default PageTitle;
