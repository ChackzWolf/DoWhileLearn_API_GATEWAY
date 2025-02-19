"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCode = void 0;
var StatusCode;
(function (StatusCode) {
    // Informational responses (100–199)  
    StatusCode[StatusCode["Continue"] = 100] = "Continue";
    StatusCode[StatusCode["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    StatusCode[StatusCode["Processing"] = 102] = "Processing";
    StatusCode[StatusCode["EarlyHints"] = 103] = "EarlyHints";
    // Successful responses (200–299)
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["Created"] = 201] = "Created";
    StatusCode[StatusCode["Accepted"] = 202] = "Accepted";
    StatusCode[StatusCode["NonAuthoritativeInformation"] = 203] = "NonAuthoritativeInformation";
    StatusCode[StatusCode["NoContent"] = 204] = "NoContent";
    StatusCode[StatusCode["ResetContent"] = 205] = "ResetContent";
    StatusCode[StatusCode["PartialContent"] = 206] = "PartialContent";
    StatusCode[StatusCode["MultiStatus"] = 207] = "MultiStatus";
    StatusCode[StatusCode["AlreadyReported"] = 208] = "AlreadyReported";
    StatusCode[StatusCode["IMUsed"] = 226] = "IMUsed";
    // Redirection messages (300–399)
    StatusCode[StatusCode["MultipleChoices"] = 300] = "MultipleChoices";
    StatusCode[StatusCode["MovedPermanently"] = 301] = "MovedPermanently";
    StatusCode[StatusCode["Found"] = 302] = "Found";
    StatusCode[StatusCode["SeeOther"] = 303] = "SeeOther";
    StatusCode[StatusCode["NotModified"] = 304] = "NotModified";
    StatusCode[StatusCode["UseProxy"] = 305] = "UseProxy";
    StatusCode[StatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    StatusCode[StatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
    // Client error responses (400–499)
    StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
    StatusCode[StatusCode["Unauthorized"] = 401] = "Unauthorized";
    StatusCode[StatusCode["PaymentRequired"] = 402] = "PaymentRequired";
    StatusCode[StatusCode["Forbidden"] = 403] = "Forbidden";
    StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
    StatusCode[StatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    StatusCode[StatusCode["NotAcceptable"] = 406] = "NotAcceptable";
    StatusCode[StatusCode["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    StatusCode[StatusCode["RequestTimeout"] = 408] = "RequestTimeout";
    StatusCode[StatusCode["Conflict"] = 409] = "Conflict";
    StatusCode[StatusCode["Gone"] = 410] = "Gone";
    StatusCode[StatusCode["LengthRequired"] = 411] = "LengthRequired";
    StatusCode[StatusCode["PreconditionFailed"] = 412] = "PreconditionFailed";
    StatusCode[StatusCode["PayloadTooLarge"] = 413] = "PayloadTooLarge";
    StatusCode[StatusCode["URITooLong"] = 414] = "URITooLong";
    StatusCode[StatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    StatusCode[StatusCode["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
    StatusCode[StatusCode["ExpectationFailed"] = 417] = "ExpectationFailed";
    StatusCode[StatusCode["ImATeapot"] = 418] = "ImATeapot";
    StatusCode[StatusCode["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    StatusCode[StatusCode["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    StatusCode[StatusCode["Locked"] = 423] = "Locked";
    StatusCode[StatusCode["FailedDependency"] = 424] = "FailedDependency";
    StatusCode[StatusCode["TooEarly"] = 425] = "TooEarly";
    StatusCode[StatusCode["UpgradeRequired"] = 426] = "UpgradeRequired";
    StatusCode[StatusCode["PreconditionRequired"] = 428] = "PreconditionRequired";
    StatusCode[StatusCode["TooManyRequests"] = 429] = "TooManyRequests";
    StatusCode[StatusCode["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    StatusCode[StatusCode["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    // Server error responses (500–599)
    StatusCode[StatusCode["InternalServerError"] = 500] = "InternalServerError";
    StatusCode[StatusCode["NotImplemented"] = 501] = "NotImplemented";
    StatusCode[StatusCode["BadGateway"] = 502] = "BadGateway";
    StatusCode[StatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    StatusCode[StatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
    StatusCode[StatusCode["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    StatusCode[StatusCode["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    StatusCode[StatusCode["InsufficientStorage"] = 507] = "InsufficientStorage";
    StatusCode[StatusCode["LoopDetected"] = 508] = "LoopDetected";
    StatusCode[StatusCode["NotExtended"] = 510] = "NotExtended";
    StatusCode[StatusCode["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
//# sourceMappingURL=enums.js.map