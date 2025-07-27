import React from "react";
import { useNavigate } from "react-router-dom";
import styles from './destinationcard.module.css';
import type { DestinatiomState } from "../../../../types/DestinationInput";
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import type { Destination } from "../../../../types/Destination";
import type { handleSearchHotel } from ""

export default function DestinationCard({
    url,
    dest,
    onclick,
}: {
    url: string;
    dest: Destination;
    onclick: (dest: Destination) => void;
}) {

    return (
    <div className={styles.container} onClick={() => onclick(dest)}>
        <img
            src={url}
            alt={dest.term}
            className={styles.bgimage}
        />
        <div className={styles.bottomtext}>
            {dest.term}
        </div>
    </div>
  );
}