import React, { useState, useCallback } from "react";
import {Map, ScaleControl, ZoomControl} from 'react-bmapgl';
import { InfoMarker,InfoWindow } from ".";


function BaiduMap(props) {
    const [focus, setFocus] = useState("")
    const [bounds, setBounds] = useState(null)
    const [shouldAutoFocus, setShouldAutoFocus] = useState(true)

    function onClickMarker(link){
        setShouldAutoFocus(true)
        if (focus == link) {
            setFocus("")
        } else {
            setFocus(link)
        }
    }

    const mapRef = useCallback(node => {
        if (node !== null && bounds == null) {
            const map = node.map
            updateBounds('init', map)
            map.addEventListener('moveend', () => {
                updateBounds('moveend', map)
            })
            map.addEventListener('zoomend', () => {
                updateBounds('zoomend', map)
            })
        }
    }, []);

    let lastUpdateTime = Date.now()
    const updateBounds = (type, map) => {
        const offset = Date.now() - lastUpdateTime;
        console.log('update timedif ', offset)
        // infowindow/autoviewport triggers move/zoom event
        // which leads infinite loop
        // prevent frequent refreshing
        if (offset < 500) return
        if (map == null) return

        lastUpdateTime = Date.now()
        const visibleBounds = map.getBounds()
        setShouldAutoFocus(false)
        setBounds(visibleBounds)
        props.handleBoundChanged(visibleBounds)
    }

    function onWindowCloseClick() {
        onClickMarker(focus)
    }

    let infoMarkers = Object.entries(props.data).map(
        ([link, entry]) =>
            <InfoMarker key={entry.record.link} record={entry.record} latLong={entry.latLong} onClickMarker={onClickMarker}/>)

    return <Map
                enableScrollWheelZoom={true}
                enableDragging={true}
                zoom={9}
                center={{lng: 113.802193, lat: 34.820333}}
                className="mapDiv"
                ref={mapRef}
                style={{height: "100%"}}>
                <ZoomControl/>
                <ScaleControl/>
                {infoMarkers}
                <InfoWindow 
                    item={props.data[focus]} 
                    shouldAutoCenter={shouldAutoFocus} 
                    onCloseClick={onWindowCloseClick}/>
            </Map>
}

export default BaiduMap