import { useContext, useEffect, useMemo, useState } from "react"
import Context from "../Context/Context"
import { JSX } from "react/jsx-runtime"
import { getColorForPercentage } from "../Utils/utils"
import styled from "styled-components"
import Select from 'react-select'


const StyledSelect = styled(Select)`
    width: 200px;
    color: #808080;
    .css-13cymwt-control{
        border-color: #54616b;
        background-color: #3B444B;
    }
    .css-t3ipsp-control{
        border-color: #54616b !important;
        background-color: #3B444B;
        box-shadow: none;
    }
    .css-1nmdiq5-menu{
        background-color: #3B444B;
    }
    .css-d7l1ni-option{
        background-color: #54616b;
    }
    .css-tr4s17-option{
        background-color: #3B444B;
    }
    .css-1dimb5e-singleValue{
        color: #808080;
    }
    .css-166bipr-Input{
        color: #808080;
    }
`

const positions = [{ value: 'TOP', label: 'TOP' }, { value: 'JUNGLE', label: 'JUNGLE' }, { value: 'MID', label: 'MID' }, { value: 'ADC', label: 'ADC' }, { value: 'SUPPORT', label: 'SUPPORT' },]
interface Props {
    championWinRates: any
}

const WinRates = ({ championWinRates }: Props) => {

    const data = useContext(Context)
    const [selectedPosition, setSelectedPosition] = useState(positions[0])

    const winRateData = useMemo(() => {
        if (data.championToImage.size === 0) {
            return
        }
        let row: JSX.Element[] = []
        let rows: JSX.Element[][] = []
        const length = championWinRates[selectedPosition.value].length
        championWinRates[selectedPosition.value].forEach((champStats: { key: string, wins: number, losses: number, pct: number }, index: number) => {
            row.push(<div style={{ marginLeft: '3px', position: 'relative' }} key={index}>
                <img src={data.championToImage.get(champStats.key).src} />
                <div style={{ position: "absolute", bottom: "5px", color: getColorForPercentage(champStats.pct), userSelect: "none", backgroundColor: "black" }} key={index}>{(champStats.pct * 100).toFixed(2) + "%"}</div>
            </div>)
            if (row.length === 9 || index === length - 1) {
                rows.push(row)
                row = []
            }
        })
        return rows.map((r, index) => {
            return <div key={index} style={{ display: 'flex' }}>{r}</div>
        })

    }, [data.championToImage, selectedPosition])

    return <div style={{ width: '1110px', margin: 'auto', padding: '50px' }}>
        <div style={{display: 'flex', marginBottom: '10px'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '3px', marginRight: '10px', fontSize: 'large'}}>Position</div>
            <StyledSelect options={positions} onChange={(selected) => setSelectedPosition(selected as { value: string, label: string })} value={selectedPosition} />
        </div>
        {winRateData}
    </div>
}

export default WinRates