import { Face3, Vector2, Vector3, Vector4, Color } from './Vendor/three.module.js';


export default class NBinary{

    /**
     * @type {ArrayBuffer|null}
     */
    data = null;

    /**
     *
     * @param data {ArrayBuffer}
     * @param options
     */
    constructor(data, options){
        this._current = 0;

        this.data = data;
        this.options = options || {};
        if (this.remain() <= 4) return;

        if (this.consume(4, 'string') === "Z2HM"){
            this._current = 8;
            let deflated = this.consume(this.remain(), 'arraybuffer');

            this.data = pako.inflate( new Uint8Array(deflated) ).buffer;
        }

        this._current = 0;
    }

    remain(){
        return this.data.byteLength - this._current;
    }

    length(){
        return this.data.byteLength;
    }

    toString(){
        let enc = new TextDecoder();
        return enc.decode(this.data);
    }


    getAbsoluteOffset(){
        if (this.options.parentOffset !== undefined){
            return this.options.parentOffset + this.current();
        }

        return this.current();
    }

    consumeMulti(amount, bytes, type, little){
        let result = [];
        for(let i = 0; i < amount; i++){
            result.push(this.consume(bytes, type, little));
        }
        return result;
    }

    uInt32(little){
        return this.consume(4, 'uint32',little);
    }

    setUInt32( val ){
        let view = new DataView(this.data, this._current, 4);
        view.setUint32(0, val, true);
        this._current += 4;
    }

    uInt16(little){
        return this.consume(2, 'uint16',little);
    }

    setUInt16( val ){
        let view = new DataView(this.data, this._current, 4);
        view.setUint16(0, val, true);
        this._current += 2;
    }

    uInt8(little){
        return this.consume(1, 'uint8',little);
    }

    setUInt8( val ){
        let view = new DataView(this.data, this._current, 4);
        view.setUint8(0, val, true);
        this._current += 1;
    }

    int32(little){
        return this.consume(4, 'int32',little);
    }

    setInt32( val ){
        let view = new DataView(this.data, this._current, 4);
        view.setInt32(0, val, true);
        this._current += 4;
    }

    int16(little){
        return this.consume(2, 'int16',little);
    }

    setInt16( val ){
        let view = new DataView(this.data, this._current, 4);
        view.setInt16(0, val, true);
        this._current += 2;
    }

    int8(little){
        return this.consume(1, 'int8',little);
    }

    setInt8( val ){
        let view = new DataView(this.data, this._current, 4);
        view.setInt8(0, val, true);
        this._current += 1;
    }

    float32(little){
        return this.consume(4, 'float32',little);
    }

    setFloat32( flt ){
        let view = new DataView(this.data, this._current, 4);
        view.setFloat32(0, flt, true);
        this._current += 4;
    }

    parseStruct(obj){

        let result = {};
        for(let attr in obj){
            if (!obj.hasOwnProperty(attr)) continue;

            if (typeof obj[attr] === "object"){
                if (obj[attr][0] === "string0") {
                    result[attr] = this.consume(obj[attr][1], 'nbinary').getString(0);
                }else if (obj[attr][0] === "seek"){
                    this.seek(obj[attr][1]);
                    result[attr] = undefined;
                }else{
                    if (typeof obj[attr][1] === "function") {
                        let val = this[obj[attr][0]]();
                        result[attr] = obj[attr][1](val);
                    }else if (typeof obj[attr][1] === "boolean"){
                        result[attr] = this[obj[attr][0]](obj[attr][1]);

                    }else{
                        debugger;

                    }
                }
            }else{
                result[attr] = this[obj[attr]]();
            }
        }

        return result;

    }

    consume(bytes, type, little) {
        little = little === undefined  ? true : little;
        let view = new DataView(this.data, this._current);

        this._current += bytes;


        if (type === 'int16') return view.getInt16(0, little);
        if (type === 'int32') return view.getInt32(0, little);
        if (type === 'uint32') return view.getUint32(0, little);
        if (type === 'float32') return view.getFloat32(0, little);
        if (type === 'uint16') return view.getUint16(0, little);
        if (type === 'int8') return view.getInt8(0);
        if (type === 'uint8') return view.getUint8(0);
        if (type === 'arraybuffer'){

            let buffer = new ArrayBuffer(bytes);
            let storeView = new DataView(buffer);

            let index = 0;
            while(bytes--){
                storeView.setUint8(index, view.getUint8(index));
                index++;
            }
            return buffer;
        }

        if (type === 'dataview'){
            return new DataView(this.data,this._current - bytes, bytes);
        }

        if (type === 'nbinary'){

            let buffer = new ArrayBuffer(bytes);
            let storeView = new DataView(buffer);

            let index = 0;
            while(bytes--){
                storeView.setUint8(index, view.getUint8(index));
                index++;
            }

            return new NBinary(buffer, { parentOffset: this.current });
        }


        if (type === 'string'){
            let str = "";
            let index = 0;
            while(bytes--){
                str += String.fromCharCode(view.getUint8(index));
                index++
            }

            return str;
        }
        console.error(type, "not known, error");
        debugger;

        return view;
    }

    /**
     *
     * @param string {string}
     * @param delimiter {int}
     * @param doPadding {boolean}
     * @param paddingChar {int|undefined}
     */
    writeString(string, delimiter, doPadding, paddingChar){

        if (paddingChar === undefined)
            paddingChar = delimiter;

        let strLen = string.length + 1;
        let padLen = 0;
        if (4 - (strLen % 4) !== 4){
            padLen = 4 - (strLen % 4);
        }

        var enc = new TextEncoder(); // always utf-8
        let encoded = enc.encode(string);

        let view = new DataView(this.data, this._current, strLen + padLen);
        let offset = 0;
        encoded.forEach(function (uInt8) {
            view.setUint8(offset, uInt8);
            offset++;
        });

        if (delimiter !== undefined){
            view.setUint8(offset, delimiter);
            offset++;
        }

        for(let i = 0; i < padLen; i++){
            view.setUint8(offset, paddingChar);
            offset++;
        }

        this._current += offset;
    }

    end(){
        this.data = this.data.slice(0, this._current);
    }

    /**
     *
     * @param data {NBinary}
     */
    append(data){
        data.setCurrent(0);
        for(let i = 0; i < data.length(); i++){
            this.setUInt8(data.consume(1, 'uint8'))
        }
    }


    getString(delimiter, doPadding) {

        let name = '';
        let nameIndex = 0;
        while(this.remain() > 0){
            let val = this.consume(1, 'uint8');
            if (val === delimiter) break;
            name += String.fromCharCode(val);
            nameIndex++;
        }

        if (doPadding === true){
            nameIndex++;

            if (4 - (nameIndex % 4) !== 4){
                this._current += 4 - (nameIndex % 4);
            }

        }

        return name;
    }



    readXYZ() {
        return {
            x: this.consume(4, 'float32'),
            y: this.consume(4, 'float32'),
            z: this.consume(4, 'float32')
        };
    }

    readVector2(byte, type) {
        byte = byte || 4;
        type = type || 'float32';

        return new Vector2(
            this.consume(byte, type),
            this.consume(byte, type)
        );
    }

    readMatrix4(byte, type){
        byte = byte || 4;
        type = type || 'float32';

        return [
            [ this.consume(byte, type), this.consume(byte, type), this.consume(byte, type) ],
            [ this.consume(byte, type), this.consume(byte, type), this.consume(byte, type) ],
            [ this.consume(byte, type), this.consume(byte, type), this.consume(byte, type) ],
            [ this.consume(byte, type), this.consume(byte, type), this.consume(byte, type) ]
        ];

    }

    readVector3(byte, type, pad, pByte, pType) {
        byte = byte || 4;
        type = type || 'float32';
        pad = pad || false;

        let vec3 = new Vector3(
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type)
        );

        if (pad === true){
            pByte = pByte || byte;
            pType = pType || type;
            this.consume(pByte, pType);
        }

        return vec3;
    }

    readFace3(byte, type) {
        byte = byte || 2;
        type = type || 'int16';

        return new Face3(
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type)
        );
    }

    readFaces3(count, materialForFace, byte, type) {
        byte = byte || 2;
        type = type || 'int16';

        let faces = [];
        for (let i = 0; i < count; i++) {

            let face3 = this.readFace3(byte, type);
            face3.materialIndex = materialForFace[i];
            faces.push(face3);
        }

        return faces;
    }

    readFloats(count) {

        let ret = [];
        while(count--){
            ret.push(this.consume(4, 'float32'));
        }

        return ret;

    }

    readVector4(byte, type) {
        byte = byte || 4;
        type = type || 'float32';

        return new Vector4(
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type)
        );
    }

    readXYZW() {
        return {
            x: this.consume(4, 'float32'),
            y: this.consume(4, 'float32'),
            z: this.consume(4, 'float32'),
            w: this.consume(4, 'float32')
        };
    }

    readColorRGBA(byte, type) {
        byte = byte || 1;
        type = type || 'uint8';

        let rgba = [
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type)
        ];

        return new Color(
            rgba[0], rgba[1], rgba[2]
        );
    }

    readColorRGB(byte, type) {
        byte = byte || 1;
        type = type || 'uint8';

        let rgba = [
            this.consume(byte, type),
            this.consume(byte, type),
            this.consume(byte, type)
        ];

        return new Color(
            rgba[0], rgba[1], rgba[2]
        );
    }

    readColorBGRADiv255(byte, type) {
        byte = byte || 1;
        type = type || 'uint8';

        let bgra = [
            this.consume(byte, type) / 255.0,
            this.consume(byte, type) / 255.0,
            this.consume(byte, type) / 255.0,
            this.consume(byte, type)
        ];

        return new Color(
            bgra[2], bgra[1], bgra[0]
        );
    }

    seek(bytes) {
        this._current = this._current + bytes;
    }

    setCurrent(cur){
        this._current = cur;
    }

    current (){
        return this._current;
    }


}
