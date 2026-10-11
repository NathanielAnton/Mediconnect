<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\PdfImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfImageController extends Controller
{
    public function index(Request $request)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $images = PdfImage::where('medecin_profile_id', $profile->id)
            ->latest()
            ->get(['id', 'nom', 'mime', 'taille', 'created_at']);

        return response()->json(['images' => $images]);
    }

    public function store(Request $request)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $request->validate([
            'image' => 'required|file|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        $file = $request->file('image');
        $chemin = $file->store("pdf-images/{$profile->id}", 'local');

        $image = PdfImage::create([
            'medecin_profile_id' => $profile->id,
            'nom' => $file->getClientOriginalName(),
            'chemin' => $chemin,
            'mime' => $file->getMimeType(),
            'taille' => $file->getSize(),
        ]);

        return response()->json([
            'message' => 'Image ajoutée à la bibliothèque',
            'image' => $image,
        ], 201);
    }

    public function file(Request $request, int $id)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $image = PdfImage::where('medecin_profile_id', $profile->id)->findOrFail($id);
        abort_unless(Storage::disk('local')->exists($image->chemin), 404);

        return Storage::disk('local')->response($image->chemin, null, [
            'Content-Type' => $image->mime,
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $image = PdfImage::where('medecin_profile_id', $profile->id)->findOrFail($id);
        Storage::disk('local')->delete($image->chemin);
        $image->delete();

        return response()->json(['message' => 'Image supprimée']);
    }
}
