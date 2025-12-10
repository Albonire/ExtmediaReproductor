import GLib from "gi://GLib";
import Gio from "gi://Gio";

import { handleError } from "./common.js";

/**
 * @param {string} uuid
 * @returns {Promise<void>}
 */
export async function clearCache(uuid) {
    const cacheDir = GLib.build_pathv("/", [GLib.get_user_cache_dir(), uuid]);

    if (!GLib.file_test(cacheDir, GLib.FileTest.EXISTS)) {
        return;
    }

    const folder = Gio.File.new_for_path(cacheDir);
    const success = await folder.trash_async(null, null).catch(handleError);

    if (success) {
        return Promise.resolve();
    } else {
        return Promise.reject(new Error("Failed to clear cache"));
    }
}

/**
 * @param {string} uuid
 * @returns {Promise<number>}
 */
export async function getCacheSize(uuid) {
    const cacheDir = GLib.build_pathv("/", [GLib.get_user_cache_dir(), uuid]);
    let size = 0;

    if (!GLib.file_test(cacheDir, GLib.FileTest.EXISTS)) {
        return size;
    }

    const folder = Gio.File.new_for_path(cacheDir);
    const enumerator = await folder
        .enumerate_children_async("standard::*", Gio.FileQueryInfoFlags.NONE, 0, null)
        .catch(handleError);

    if (enumerator == null) {
        return size;
    }

    let retries = 0;
    while (true) {
        const fileInfos = await enumerator.next_files_async(10, null, null).catch(handleError);
        if (fileInfos == null) {
            if (retries < 3) {
                retries++;
                continue;
            } else {
                break;
            }
        }
        if (fileInfos.length === 0) {
            break;
        }
        for (const fileInfo of fileInfos) {
            const file = enumerator.get_child(fileInfo);
            const info = await file
                .query_info_async("standard::size", Gio.FileQueryInfoFlags.NONE, 0, null)
                .catch(handleError);
            const fileSize = info?.get_size() ?? 0;
            size += fileSize;
        }
    }

    return size;
}
