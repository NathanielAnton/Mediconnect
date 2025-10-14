<?php

namespace App\Http\Controllers;

use App\Models\Specialite;
use Illuminate\Http\Request;

class SpecialiteController extends Controller
{
    public function index()
    {
        $specialites = Specialite::orderBy('nom')->get();
        
        return response()->json($specialites);
    }
}