// Custom Supabase domain for storage URLs
const SUPABASE_CUSTOM_DOMAIN = 'mediaklinger.nordvynextgen.com';

/**
 * Generate a public URL for a file in Supabase storage using the custom domain
 */
export function getStoragePublicUrl(bucket: string, storagePath: string): string {
  return `https://${SUPABASE_CUSTOM_DOMAIN}/storage/v1/object/public/${bucket}/${storagePath}`;
}
