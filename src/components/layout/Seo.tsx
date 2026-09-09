import { Helmet } from "react-helmet-async";
import type { Settings } from "../../lib/types";

export default function Seo({ settings }: { settings: Settings }) {
  return (
    <Helmet>
      <title>{settings.seoTitle}</title>
      <meta name="description" content={settings.seoDesc} />
      {settings.seoKeywords?.length ? (
        <meta name="keywords" content={settings.seoKeywords.join(", ")} />
      ) : null}
      <meta property="og:title" content={settings.seoTitle} />
      <meta property="og:description" content={settings.seoDesc} />
    </Helmet>
  );
}
