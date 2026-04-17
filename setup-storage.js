require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageBucket() {
  try {
    console.log('🔧 Setting up Supabase storage bucket...\n');

    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('📦 Existing buckets:');
    buckets.forEach(bucket => console.log(`  - ${bucket.name} (Public: ${bucket.public})`));

    const bucketName = 'products';
    const bucketExists = buckets.some(b => b.name === bucketName);

    if (bucketExists) {
      console.log(`\n✅ Bucket '${bucketName}' already exists`);
    } else {
      console.log(`\n📝 Creating bucket '${bucketName}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });

      if (createError) {
        console.error(`❌ Error creating bucket: ${createError.message}`);
        return;
      }

      console.log(`✅ Bucket '${bucketName}' created successfully`);
    }

    // Verify the bucket is public
    const { data: bucketInfo, error: infoError } = await supabase.storage.getBucket(bucketName);
    if (infoError) {
      console.error(`❌ Error getting bucket info: ${infoError.message}`);
      return;
    }

    console.log(`\n📊 Bucket details:`);
    console.log(`  - Name: ${bucketInfo.name}`);
    console.log(`  - Public: ${bucketInfo.public}`);
    console.log(`  - Created: ${bucketInfo.created_at}`);
    console.log(`  - Updated: ${bucketInfo.updated_at}`);

    // Test uploading a file
    console.log(`\n🧪 Testing upload...`);
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'Test file for bucket verification';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, new TextEncoder().encode(testContent), {
        contentType: 'text/plain',
      });

    if (uploadError) {
      console.error(`❌ Upload failed: ${uploadError.message}`);
      return;
    }

    console.log(`✅ Test file uploaded: ${testFileName}`);

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from(bucketName)
      .getPublicUrl(testFileName);

    console.log(`\n🔗 Public URL:`);
    console.log(`  ${publicUrl.publicUrl}`);

    // Cleanup: Delete test file
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testFileName]);

    if (deleteError) {
      console.warn(`⚠️ Could not delete test file: ${deleteError.message}`);
    } else {
      console.log(`\n✅ Test file deleted`);
    }

    console.log('\n🎉 Storage bucket setup complete!');
    console.log('📸 Product images will now be stored in Supabase Storage');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupStorageBucket();
