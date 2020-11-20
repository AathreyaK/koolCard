precision mediump float;

struct DirectionalLight
{
	vec3 direction;
	vec3 color;
};

varying vec3 fragPosition;
varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;
uniform vec3 ambientLight;
uniform DirectionalLight sun;
uniform vec3 lightPos;
uniform vec3 cameraPos;

void main()
{
	vec3 surfaceNormal = normalize(fragNormal);

	vec4 texel = texture2D(sampler, fragTexCoord);

	// Specular Lighting
	vec3 lightToPosDirVec = normalize(lightPos - fragPosition);
	vec3 reflectDirVec = normalize(reflect(lightToPosDirVec, surfaceNormal));
	vec3 posToViewDirVec = normalize(fragPosition - cameraPos);
	float specularConstant = pow(max(dot(posToViewDirVec, reflectDirVec), 0.0), 10.0);
	vec3 specularFinal = vec3(1.0, 1.0, 1.0) * specularConstant;

	vec3 lightIntensity = ambientLight + max(sun.color * dot(surfaceNormal, sun.direction), 0.0) + specularFinal;
	gl_FragColor = vec4((texel.rgb * lightIntensity).rgb, texel.a);
}