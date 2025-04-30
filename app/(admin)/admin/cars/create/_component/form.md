## here we will be using react hook form along with zode

link: npm i react-hook-form zod @hookform/resolvers
@hookform/resolvers: this will help you to connect both zod and hook form

1. define the schema of the form using zod

## note:Zod

What is Zod?
Zod is a TypeScript-first schema declaration and validation library. It allows you to define the shape of your data (like form inputs or API payloads) and validate that data easily and safely.

In simple terms:
You define what your data should look like.
Zod checks if the data actually matches that shape.
If not, it throws clear and useful validation errors.

Note: if any error occure while uploading images there may be policy uploading issue .we need to add new poliecy in the storage
bucket

      example:

## New policies for uploading image

        this policies is for allowing user to upload the images
        policies ->createpolicies ->click on for full customisation -> selct the allowed operation that we needed
        ->give description ->review->savepoliceis
