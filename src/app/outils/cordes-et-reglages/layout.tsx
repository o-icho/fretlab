import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { featureRouteFallback } from "@/config/requireFeature";
import styles from "./section.module.css";

export default function StringsLayout({ children }: { children: ReactNode }) {
  return featureRouteFallback("strings") ?? <Container className={styles.section}>{children}</Container>;
}
