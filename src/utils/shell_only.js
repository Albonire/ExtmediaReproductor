import Gio from "gi://Gio";
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import GLib from "gi://GLib";
import Soup from "gi://Soup";
import { errorLog, handleError } from "./common.js";

Gio._promisify(Gio.DBusProxy, "new", "new_finish");
Gio._promisify(Gio.File.prototype, "replace_contents_bytes_async", "replace_contents_finish");
Gio._promisify(Gio.File.prototype, "read_async", "read_finish");
Gio._promisify(Soup.Session.prototype, "send_and_read_async", "send_and_read_finish");

/**
 * @param {string} id
 * @param {string} entry
 * @returns {Shell.App | null}
 */
export const getAppInfoByIdAndEntry = (id, entry) => {
    const appSys = Shell.AppSystem.get_default();

    let app = appSys.lookup_app(id);
    if (app) return app;

    app = appSys.lookup_app(entry);
    if (app) return app;

    app = Gio.DesktopAppInfo.new(id);
    if (app) return Shell.App.new(app);

    app = Gio.DesktopAppInfo.new(entry);
    if (app) return Shell.App.new(app);

    return null;
};

/**
 * @param {Gio.DBusInterfaceInfo} ifaceInfo
 * @param {string} busName
 * @param {string} path
 * @returns {Promise<Gio.DBusProxy | null>}
 */
export const createDbusProxy = (ifaceInfo, busName, path) => {
    return new Promise((resolve) => {
        Gio.DBusProxy.new(
            Gio.DBus.session,
            Gio.DBusProxyFlags.NONE,
            ifaceInfo,
            busName,
            path,
            busName,
            null,
            (proxy) => {
                if (proxy) {
                    resolve(proxy);
                } else {
                    resolve(null);
                }
            },
        );
    });
};

/**
 * @param {string} url
 * @param {string} uuid
 * @returns {Promise<Gio.InputStream>}
 */
export const getImage = async (url, uuid) => {
    if (url == null || url == "") {
        return null;
    }
    const encoder = new TextEncoder();
    const urlBytes = encoder.encode(url);
    const encodedUrl = GLib.base64_encode(urlBytes);
    const path = GLib.build_filenamev([GLib.get_user_cache_dir(), uuid, encodedUrl]);
    const exitCode = GLib.mkdir_with_parents(GLib.path_get_dirname(path), 493);
    if (exitCode === -1) {
        errorLog(`Failed to create cache directory: ${path}`);
        return null;
    }
    const file = Gio.File.new_for_path(path);
    if (file.query_exists(null)) {
        const stream = await file.read_async(null, null).catch(handleError);
        if (stream == null) {
            errorLog(`Failed to load image from cache: ${encodedUrl}`);
            return null;
        }
        return stream;
    } else {
        const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
        if (uri == null) {
            return null;
        }
        const scheme = uri.get_scheme();
        if (scheme === "file") {
            const file = Gio.File.new_for_uri(uri.to_string());
            if (file.query_exists(null) === false) {
                return null;
            }
            const stream = await file.read_async(null, null).catch(handleError);
            if (stream == null) {
                errorLog(`Failed to load local image: ${encodedUrl}`);
                return null;
            }
            return stream;
        } else if (scheme === "http" || scheme === "https") {
            const session = new Soup.Session();
            const message = new Soup.Message({ method: "GET", uri });
            const bytes = await session.send_and_read_async(message, null, null).catch(handleError);
            if (bytes == null) {
                errorLog(`Failed to load image: ${url}`);
                return null;
            }
            const resultPromise = file.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.NONE, null);
            const result = await resultPromise.catch(handleError);
            if (result?.[0] === false) {
                errorLog(`Failed to cache image: ${url}`);
                return null;
            }
            const stream = await file.read_async(null, null).catch(handleError);
            if (stream == null) {
                errorLog(`Failed to load cached image: ${url}`);
                return null;
            }
            return stream;
        } else {
            errorLog(`Invalid scheme: ${scheme}`);
            return null;
        }
    }
};

/**
 * @param {unknown} error
 * @returns {void}
 */
export const handleErrorWithDialog = (error) => {
    const dialog = new Main.ErrorDialog(error);
    dialog.open();
};
