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

interface Props {
    setValue: (value: any) => void
    value: string | number
    defaultValue?: any
    type?: 'number'
    maxLength?: number
}

const Input = ({setValue, value, defaultValue, type, maxLength}: Props) => {
    return <StyledSelect
    isSearchable={true}
    isClearable={false}
    components={{
        DropdownIndicator: null,
        IndicatorSeparator: null,
    }}
    onInputChange={(value, action) => {
        if (action.action === 'input-change') {
            if(maxLength && value.length > maxLength){
                return
            }
            // debugger
            if(!type){
                setValue(value)
            }
            else if(type && type === 'number' && !Number.isNaN(parseInt(value)) || value === ''){
                setValue(value === '' ? 0 : parseInt(value))
            }

        }
    }}
    onFocus={() => {
        setValue(defaultValue ?? '')
    }}
    onBlur={() => null}
    options={[]}
    menuIsOpen={false}
    value={{ value: '', label: value }}
/>
}

export default Input