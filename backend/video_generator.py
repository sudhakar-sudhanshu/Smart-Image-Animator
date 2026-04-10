import replicate

def generate_video(image_path, prompt):
    output = replicate.run(
        "stability-ai/stable-video-diffusion",
        input={
            "image": open(image_path, "rb"),
            "prompt": prompt
        }
    )
    return output