import DocumentData from "./model/documentData";

export default class Validator {
    public validate(type: string, value: string): boolean {
        if (value) {
            if (type === "email") {
                return this.validateEmail(value);
            } else if (type === "name") {
                return this.validateName(value);
            } else if (type === "shortString") {
                return this.validateShortString(value);
            } else if (type === "longString") {
                return this.validateLongString(value);
            } else if (type === "phone") {
                return this.validatePhone(value);
            }
        }
        return false;
    }

    public validateWrittenDocument(documentData: DocumentData): boolean {
        const mimeType = documentData.mime_type;
        const isAllowedSize = documentData.file_size <= 15000000;
        if (documentData.mime_type.indexOf("image") > -1) {
            return false;
        }
        return (
            isAllowedSize &&
            (mimeType === "application/pdf" ||
                mimeType === "application/msword" ||
                mimeType ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                mimeType === "application/vnd.oasis.opendocument.text" ||
                mimeType === "text/plain")
        );
    }

    public hasEventBodyDocument(eventBody: any): boolean {
        return eventBody.message.document ? true : false;
    }

    public hasEventBodyMessage(eventBody: any): boolean {
        return eventBody.message.text ? true : false;
    }

    private validateEmail(value: string) {
        const regExp = /^\S+@\S+$/g;
        return regExp.test(value);
    }

    private validateName(value: string): boolean {
        if (value.length > 30) return false;
        const regExp = /^[a-zA-Z]\w+$/g;
        return regExp.test(value[0] == "@" ? value.substr(1, 30) : value);
    }

    private validateShortString(value: string): boolean {
        return value.length <= 30;
    }

    private validateLongString(value: string): boolean {
        return value.length <= 1000;
    }

    private validatePhone(value: string): boolean {
        const regExp = /^(?=.*[0-9])[- +()0-9]+$/g;
        return regExp.test(value);
    }
}
