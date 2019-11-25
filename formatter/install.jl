# !/usr/bin/env julia
# From https://github.com/julia-actions/julia-format/blob/d9cea40/format.jl#L1-L21
import Pkg

if isfile("Project.toml")
    # Okay, we're in $GITHUB_WORKSPACE, and we have a Julia package.
    project = read("Project.toml", String)
    if occursin("uuid = \"98e50ef6-434e-11e9-1051-2b60c6c9e899\"", project)
        # This package is JuliaFormatter itself. Let's use the copy stored here
        # instead of the last taged version
        Pkg.add(Pkg.PackageSpec(path = pwd()))
    else
        # This is a package that's not JuliaFormatter. Just use the last tagged
        # version of JuliaFormatter.jl.
        Pkg.add("JuliaFormatter")
    end
else
    # This doesn't look like a standard Julia package, but it might be a script.
    # In any case, it isn't JuliaFormatter.jl.
    Pkg.add("JuliaFormatter")
end
