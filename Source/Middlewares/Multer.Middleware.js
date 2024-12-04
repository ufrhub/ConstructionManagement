import MULTER from "multer";
import PATH from "path";
import URL from "url";

const _FILE_NAME = URL.fileURLToPath(import.meta.url);
const _DIRECTORY_NAME = PATH.dirname(_FILE_NAME);

const STORAGE = MULTER.diskStorage({
    destination: function (Request, File, Callback) {
        const UploadPath = PATH.join(_DIRECTORY_NAME, "../../Public/Temporary");
        Callback(null, UploadPath);
    },

    filename: function (Request, File, Callback) {
        const UniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        Callback(null, File.fieldname + "-" + UniqueSuffix);
    }
});

export const UPLOAD = MULTER({ storage: STORAGE });