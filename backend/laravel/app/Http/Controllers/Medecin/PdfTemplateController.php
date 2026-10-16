<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\MedecinProfile;
use App\Models\PdfImage;
use App\Models\PdfTemplate;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PdfTemplateController extends Controller
{
    public function index(Request $request)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $request->validate(['type' => 'nullable|in:ordonnance,facture']);

        $templates = PdfTemplate::where('medecin_profile_id', $profile->id)
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->input('type')))
            ->latest()
            ->get(['id', 'nom', 'type', 'format', 'created_at', 'updated_at']);

        return response()->json(['templates' => $templates]);
    }

    public function store(Request $request)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $validated = $this->validateTemplate($request, $profile);

        $template = PdfTemplate::create(['medecin_profile_id' => $profile->id] + $validated);

        return response()->json([
            'message' => 'Modèle créé',
            'template' => $template,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $template = $this->findOwned($request, $id);

        return response()->json(['template' => $template]);
    }

    public function update(Request $request, int $id)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $template = $this->findOwned($request, $id);
        $template->update($this->validateTemplate($request, $profile));

        return response()->json([
            'message' => 'Modèle mis à jour',
            'template' => $template->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $template = $this->findOwned($request, $id);
        $template->delete();

        return response()->json(['message' => 'Modèle supprimé']);
    }

    private function findOwned(Request $request, int $id): PdfTemplate
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        return PdfTemplate::where('medecin_profile_id', $profile->id)->findOrFail($id);
    }

    private function validateTemplate(Request $request, MedecinProfile $profile): array
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'type' => 'required|in:ordonnance,facture',
            'format' => 'nullable|in:A4',
            'layout' => 'required|array',
            'layout.format' => 'nullable|in:A4',
            'layout.elements' => 'present|array',
            'layout.elements.*.id' => 'nullable',
            'layout.elements.*.type' => 'required|in:texte,image,variable,saisie,tableau',
            'layout.elements.*.x' => 'nullable|numeric',
            'layout.elements.*.y' => 'nullable|numeric',
            'layout.elements.*.width' => 'nullable|numeric|min:1',
            'layout.elements.*.height' => 'nullable|numeric|min:1',
            'layout.elements.*.fontSize' => 'nullable|numeric|min:1|max:200',
            'layout.elements.*.bold' => 'nullable|boolean',
            'layout.elements.*.color' => 'nullable|string|max:9',
            'layout.elements.*.align' => 'nullable|in:left,center,right',
            'layout.elements.*.text' => 'nullable|string|max:5000',
            'layout.elements.*.source' => 'nullable|string|max:255',
            'layout.elements.*.key' => 'nullable|string|max:100',
            'layout.elements.*.label' => 'nullable|string|max:255',
            'layout.elements.*.columns' => 'nullable|array',
            'layout.elements.*.columns.*.key' => 'required|string|max:100',
            'layout.elements.*.columns.*.label' => 'nullable|string|max:255',
            'layout.elements.*.pdf_image_id' => 'nullable|integer',
        ]);

        $imageIds = collect($validated['layout']['elements'])
            ->pluck('pdf_image_id')
            ->filter()
            ->unique()
            ->values();

        if ($imageIds->isNotEmpty()) {
            $owned = PdfImage::where('medecin_profile_id', $profile->id)
                ->whereIn('id', $imageIds)
                ->count();

            if ($owned !== $imageIds->count()) {
                throw ValidationException::withMessages([
                    'layout' => "Un logo sélectionné n'appartient pas à votre bibliothèque.",
                ]);
            }
        }

        $validated['format'] = $validated['format'] ?? 'A4';

        return $validated;
    }
}
