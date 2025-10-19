# Supabase Storage Bucket Setup

## Required Action: Create Storage Bucket

You need to create a storage bucket in Supabase to store project cover images.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Go to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create the Bucket**
   - Bucket name: `projects`
   - Make it **PUBLIC** (important!)
   - Click "Create bucket"

4. **Set Storage Policies**
   Run this SQL in the SQL Editor to allow authenticated users to upload files:

```sql
-- Allow authenticated users to upload to project-covers folder
CREATE POLICY "Allow authenticated uploads to project-covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'projects' 
  AND (storage.foldername(name))[1] = 'project-covers'
);

-- Allow public read access to all files in projects bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'projects');

-- Allow users to update their own uploads
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'projects' 
  AND (storage.foldername(name))[1] = 'project-covers'
  AND owner = auth.uid()
);

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'projects' 
  AND (storage.foldername(name))[1] = 'project-covers'
  AND owner = auth.uid()
);
```

### Verification

Once the bucket is created:
1. Try uploading a cover image when submitting a project
2. The image should be visible in the project gallery
3. Images are stored in the `project-covers/` folder within the bucket

### Bucket Configuration

- **Name**: `projects`
- **Public**: ✅ Yes (required for displaying images)
- **File size limit**: Default (usually 50MB)
- **Allowed MIME types**: All image types (image/*)

### Folder Structure

```
projects/
└── project-covers/
    ├── [user_id]-[timestamp].jpg
    ├── [user_id]-[timestamp].png
    └── ...
```

Each uploaded cover image is named with the user's ID and timestamp to ensure uniqueness.

### Testing

After setup, test by:
1. Going to "Submit Project" page
2. Uploading a cover image
3. Submitting the project
4. Checking the Project Gallery to see the cover image displayed

## Alternative: Use Existing Bucket

If you already have a storage bucket you want to use:
1. Update the bucket name in `/Users/krishsharma/Desktop/Hacktober_fest/src/pages/SubmitProject.tsx`
2. Change `.from('projects')` to `.from('your-bucket-name')`
3. Make sure the bucket is public
4. Apply the storage policies above (adjust bucket_id accordingly)

