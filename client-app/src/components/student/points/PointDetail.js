import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getPoint } from "../../../api/point";

const PointDetail = () => {
    const { pointId } = useParams();
    const shouldFetch = useRef(true);
    const [pointRes, setPointRes] = useState(
        { status: "NONE", data: null }
    );
    useEffect(() => {
        if (shouldFetch) {
            shouldFetch.current = false;
            getPoint(pointId).then(
                res => setPointRes(res)
            )
        }
    }, [pointId])
    return (
        <>
            {pointRes.data && (
                <p>{JSON.stringify(pointRes.data)}</p>
            )}
        </>
    )
}

export default PointDetail;