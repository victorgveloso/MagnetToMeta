import {
    isVideo,
    isSubtitle,
    isDisk
} from "../../src/lib/extension";

let params = [
    ["arquivo.flv","video"],
    ["arquivo.iso","disk"],
    ["arquivo.srt","subtitle"] // TODO: add more test cases
]

it.each(params)("should be correctly mapped as video", (filename: string, format: string) => {
    let isVideoFormat = format === "video";
    expect(isVideo(filename)).toEqual(isVideoFormat);
})

it.each(params)("should be correctly mapped as subtitle", (filename: string, format: string) => {
    let isSubtitleFormat = format === "subtitle";
    expect(isSubtitle(filename)).toEqual(isSubtitleFormat);

})

it.each(params)("should be correctly mapped as disk", (filename: string, format: string) => {
    let isDiskFormat = format === "disk";
    expect(isDisk(filename)).toEqual(isDiskFormat);

})