import { GetSetting } from "../../wailsjs/go/setting/Service";
import supabaseClient from "./supabase";

export async function hasPermission(permission: string): Promise<boolean> {
    try {
        const setting = await GetSetting();
        const adminKey = setting.AdminKey;

        if (!adminKey) {
            return false;
        }

        const { data, error } = await supabaseClient
            .from('admin_key')
            .select('permissions')
            .eq('admin_key', adminKey.trim())
            .single();

        if (error) {
            console.error("Error fetching admin key from Supabase:", error);
            return false;
        }

        if (data && data.permissions && Array.isArray(data.permissions)) {
            return data.permissions.includes(permission);
        }

        return false;
    } catch (e) {
        console.error("Failed to check permission:", e);
        return false;
    }
}