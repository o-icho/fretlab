import Image from "next/image";
import styles from "./brand.module.css";

export function Brand() {
  return (
    <span className={styles.wordmark}>
      <Image src="/icon.svg" alt="" width={39} height={39} unoptimized />
      FretLab
    </span>
  );
}
