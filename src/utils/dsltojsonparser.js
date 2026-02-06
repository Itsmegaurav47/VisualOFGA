import {transformer} from '@openfga/syntax-transformer';

export function transformDSLToJSON(dsl) {
    const jsonObject = transformer.transformDSLToJSONObject(dsl);
    // console.log(' JSON Object:\n', JSON.stringify(jsonObject, null, 2));
    return JSON.stringify(jsonObject, null, 2);
}

export function transformJSONToDSL(jsonObject) {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const restoredDSL = transformer.transformJSONStringToDSL(jsonString);
    return restoredDSL;

}
