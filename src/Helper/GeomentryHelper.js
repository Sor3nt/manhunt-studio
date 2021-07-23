export default class GeometryHelper{

    /**
     * @param binary
     * @returns {{face3: [int, int, int], materialId: int}}
     */
    static face21Mat3( binary ){

        let f2 = binary.uInt16();
        let f1 = binary.uInt16();
        let matId = binary.uInt16();
        let f3 = binary.uInt16();

        return {
            face3: [f1, f2, f3],
            materialId: matId
        }
    }

}