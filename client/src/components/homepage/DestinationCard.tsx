import styles from './destinationcard.module.css';
import type { Destination } from "../../../../types/Destination";

export default function DestinationCard({
    dest,
    onclick,
}: {
    dest: Destination;
    onclick: (dest: Destination) => void;
}) {

    return (
    <div className={styles.container} onClick={() => onclick(dest)}>
        <div className={styles.bgimage}></div>
        <div className={styles.bottomtext}>
            {dest.term}
        </div>
    </div>
  );
}